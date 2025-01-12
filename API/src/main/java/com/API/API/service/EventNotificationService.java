package com.API.API.service;

import com.API.API.dto.UpdateNotificationRequest;
import com.API.API.model.Customer;
import com.API.API.model.Event;
import com.API.API.model.EventNotification;
import com.API.API.repository.EventNotificationRepository;
import com.API.API.repository.EventRepository;
import com.API.API.repository.EventUserRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventNotificationService {

    @Autowired
    private EventNotificationRepository notificationRepository;

    @Autowired
    private EventUserRepository eventUserRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EventRepository eventRepository;

    /**
     * Lấy tất cả thông báo và tự động tạo thông báo cho các EventUserID chưa có.
     */
    public List<EventNotification> getAllNotificationsWithEventUserIds() {
        List<Integer> allEventUserIds = eventUserRepository.findAllEventUserIds();
        List<Integer> existingNotificationEventUserIds = notificationRepository.findAllEventUserIdsWithNotifications();
        List<Integer> missingEventUserIds = allEventUserIds.stream()
                .filter(id -> !existingNotificationEventUserIds.contains(id))
                .toList();

        for (Integer eventUserId : missingEventUserIds) {
            EventNotification newNotification = new EventNotification();
            newNotification.setEventUser(eventUserRepository.findById(eventUserId).orElseThrow());
            newNotification.setMethod(EventNotification.Method.Email);
            newNotification.setStatus(EventNotification.Status.Pending);
            newNotification.setMessage(null);
            newNotification.setSentAt(null);
            notificationRepository.save(newNotification);
        }

        return notificationRepository.findAll();
    }

    /**
     * Lấy nội dung mẫu thông báo.
     */
    public String getNotificationTemplate(EventNotification notification) {
        Customer customer = notification.getEventUser().getCustomer();
        Event event = notification.getEventUser().getEvent();

        return String.format("""
            <h2>Kính gửi Ông/Bà %s,</h2>
            <p>Chúng tôi xin thông báo về sự kiện sắp diễn ra:</p>
            <ul>
                <li><strong>Tên sự kiện:</strong> %s</li>
                <li><strong>Mô tả:</strong> %s</li>
                <li><strong>Ngày diễn ra:</strong> %s</li>
                <li><strong>Địa điểm:</strong> PAX SKY, 123 Nguyễn Đình Chiểu, Phường 6, Quận 3, Hồ Chí Minh</li>
            </ul>
            <p>Thông báo từ hệ thống: <strong>Đây là thông báo mẫu từ hệ thống. Bạn có thể chỉnh sửa nội dung này trước khi gửi.</strong></p>
        """,
                customer.getName(),
                event.getEventType().getEventTypeName(),
                event.getDescription() != null ? event.getDescription() : "Không có mô tả",
                event.getEventDate() != null ? event.getEventDate().toString() : "Không xác định");
    }

    /**
     * Gửi thông báo qua email với nội dung từ frontend.
     */
    public EventNotification sendNotification(
            Integer notificationId,
            UpdateNotificationRequest request,
            List<String> attachmentPaths) throws MessagingException {

        EventNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification không tồn tại"));

        // Kiểm tra khách hàng
        Customer customer = notification.getEventUser().getCustomer();
        if (customer == null || customer.getEmail() == null || customer.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Khách hàng hoặc email không tồn tại.");
        }

        // Cập nhật nội dung thông báo
        notification.setMessage(request.getMessage());
        notification.setSentAt(request.getSentAt());
        notification.setStatus(EventNotification.Status.Success);

        // Tiêu đề email
        String subject = "Thông báo sự kiện";
        // Nội dung email là nội dung chỉnh sửa được gửi từ frontend
        String body = request.getMessage();

        // Gửi email với các tệp đính kèm
        emailService.sendEmail(customer.getEmail(), subject, body, attachmentPaths);

        // Cập nhật ngày nhắc nhở nếu chưa có
        Event event = notification.getEventUser().getEvent();
        if (event.getReminderDate() == null) {
            event.setReminderDate(LocalDate.now().plusDays(7)); // Đặt nhắc nhở 7 ngày sau
            eventRepository.save(event); // Lưu sự kiện đã cập nhật
        }

        // Lưu thông báo
        return notificationRepository.save(notification);
    }

    /**
     * Lấy thông báo theo ID.
     */
    public EventNotification getNotificationById(Integer notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification không tồn tại với ID: " + notificationId));
    }

    /**
     * Xóa thông báo.
     */
    public void deleteNotification(Integer notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}
