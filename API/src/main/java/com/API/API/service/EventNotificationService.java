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

    // Lấy tất cả thông báo, tự động tạo thông báo cho các EventUserID chưa có
    public List<EventNotification> getAllNotificationsWithEventUserIds() {
        // Lấy danh sách tất cả EventUserID từ bảng EventUser
        List<Integer> allEventUserIds = eventUserRepository.findAllEventUserIds();

        // Lấy danh sách các EventUserID đã có thông báo trong bảng EventNotification
        List<Integer> existingNotificationEventUserIds = notificationRepository.findAllEventUserIdsWithNotifications();

        // Tìm các EventUserID chưa có thông báo
        List<Integer> missingEventUserIds = allEventUserIds.stream()
                .filter(id -> !existingNotificationEventUserIds.contains(id))
                .toList();

        // Tạo thông báo mới với các giá trị mặc định cho các EventUserID chưa có thông báo
        for (Integer eventUserId : missingEventUserIds) {
            EventNotification newNotification = new EventNotification();
            newNotification.setEventUser(eventUserRepository.findById(eventUserId).orElseThrow());
            newNotification.setMethod(EventNotification.Method.Email); // Mặc định phương thức là Email
            newNotification.setStatus(EventNotification.Status.Pending); // Mặc định trạng thái là Pending
            newNotification.setMessage(null); // Nội dung thông báo để null
            newNotification.setSentAt(null); // Thời gian gửi để null
            notificationRepository.save(newNotification); // Lưu vào database
        }

        // Trả về danh sách tất cả thông báo
        return notificationRepository.findAll();
    }

    // Gửi thông báo
    public EventNotification sendNotification(Integer notificationId, UpdateNotificationRequest request) throws MessagingException {
        EventNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        // Kiểm tra khách hàng
        Customer customer = notification.getEventUser().getCustomer();
        if (customer == null || customer.getEmail() == null || customer.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Khách hàng hoặc email không tồn tại.");
        }

        // Lấy thông tin sự kiện và người phụ trách
        Event event = notification.getEventUser().getEvent();
        String eventTypeName = event.getEventType().getEventTypeName();
        String eventDescription = event.getDescription() != null ? event.getDescription() : "Không có mô tả";
        String eventDate = event.getEventDate() != null ? event.getEventDate().toString() : "Không xác định";
        String reminderDate = event.getReminderDate() != null ? event.getReminderDate().toString() : "Chưa được thiết lập";

        // Lấy email khách hàng
        String toEmail = customer.getEmail();

        // Cập nhật nội dung và thời gian gửi
        notification.setMessage(request.getMessage());
        notification.setSentAt(request.getSentAt());
        notification.setStatus(EventNotification.Status.Success);

        // Tạo nội dung email
        String subject = "Thông báo sự kiện: " + eventTypeName;
        String body = String.format("""
            Kính gửi Ông/Bà %s,

            Đây là thông báo về sự kiện sắp diễn ra:
            - Tên sự kiện: %s
            - Mô tả: %s
            - Ngày diễn ra: %s
            - Ngày nhắc nhở: %s

            Thông báo từ hệ thống: %s

            Trân trọng,
            Ban tổ chức Công Ty Hòa Bình
            """,
                customer.getName(),
                eventTypeName,
                eventDescription,
                eventDate,
                reminderDate,
                request.getMessage()
        );

        // Gửi email
        emailService.sendEmail(toEmail, subject, body);

        // Tự động cập nhật ngày nhắc nhở nếu cần
        if (event.getReminderDate() == null) {
            event.setReminderDate(LocalDate.now().plusDays(7)); // Đặt nhắc nhở 7 ngày sau
            eventRepository.save(event); // Lưu sự kiện đã cập nhật
        }

        // Lưu thông báo đã cập nhật
        return notificationRepository.save(notification);
    }

    // Lấy thông báo theo ID
    public EventNotification getNotificationById(Integer notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with ID: " + notificationId));
    }

    // Xóa thông báo
    public void deleteNotification(Integer notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}
