
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
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thông Báo Sự Kiện Hòa Bình</title>
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                        color: #333;
                    }

                    .email-container {
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        margin-top: 20px;
                    }

                    .header {
                        background-color: #007BFF;
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                    }

                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                    }

                    .content {
                        padding: 20px;
                    }

                    .footer {
                        background-color: #f1f1f1;
                        text-align: center;
                        padding: 15px;
                        font-size: 14px;
                        color: #777;
                        border-bottom-left-radius: 8px;
                        border-bottom-right-radius: 8px;
                    }

                    .button {
                        background-color: #28a745;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        margin-top: 20px;
                    }

                    .button:hover {
                        background-color: #218838;
                    }
                </style>
            </head>
            <body>
                <div class="container email-container">
                    <div class="header">
                        <h1>Thông Báo Sự Kiện Hòa Bình</h1>
                    </div>
                    <div class="content">
                        <h2>Kính gửi Ông/Bà %s,</h2>
                        <p>Chúng tôi xin thông báo về sự kiện sắp diễn ra:</p>
                        <ul class="list-unstyled">
                            <li><strong>Tên sự kiện:</strong> %s</li>
                            <li><strong>Mô tả:</strong> %s</li>
                            <li><strong>Ngày diễn ra:</strong> %s</li>
                             <li><strong>Địa điểm </strong> PAX SKY, 123 Nguyễn Đình Chiểu, Phường 6, Quận 3, Hồ Chí Minh</li>
                        </ul>
                        <p>Thông báo từ hệ thống: <strong>%s</strong></p>
                    </div>
                    <div class="footer">
                     <img src="https://saca.com.vn/vnt_upload/partner/47_ztt.png" alt="Logo Hòa Bình">
                        <p>Cảm ơn bạn đã quan tâm! <br> Công ty Hòa Bình - Điện thoại: 123-456-7890</p>
                    </div>
                </div>
            </body>
            </html>
            """,
                customer.getName(),        // Tên khách hàng
                eventTypeName,             // Tên sự kiện
                eventDescription,          // Mô tả sự kiện
                eventDate,                 // Ngày diễn ra sự kiện
                request.getMessage()       // Thông báo hệ thống
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
