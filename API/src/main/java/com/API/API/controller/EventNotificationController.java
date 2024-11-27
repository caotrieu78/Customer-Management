package com.API.API.controller;

import com.API.API.dto.UpdateNotificationRequest;
import com.API.API.model.EventNotification;
import com.API.API.service.EventNotificationService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class EventNotificationController {

    @Autowired
    private EventNotificationService notificationService;

    // Lấy tất cả thông báo (bao gồm tự động tạo thông báo nếu chưa tồn tại)
    @GetMapping
    public ResponseEntity<List<EventNotification>> getAllNotifications() {
        List<EventNotification> notifications = notificationService.getAllNotificationsWithEventUserIds();
        return ResponseEntity.ok(notifications);
    }

    // Lấy thông báo chi tiết theo ID
    @GetMapping("/{notificationId}")
    public ResponseEntity<EventNotification> getNotificationById(@PathVariable Integer notificationId) {
        EventNotification notification = notificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(notification);
    }

    // API để gửi thông báo
    // API để gửi thông báo
    @PutMapping("/{notificationId}/send")
    public ResponseEntity<?> sendNotification(
            @PathVariable Integer notificationId,
            @RequestBody UpdateNotificationRequest request) {
        try {
            EventNotification updatedNotification = notificationService.sendNotification(notificationId, request);
            return ResponseEntity.ok(updatedNotification);
        } catch (IllegalArgumentException e) {
            // Lỗi liên quan đến dữ liệu không hợp lệ (ví dụ: thông báo không tồn tại, email rỗng)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (MessagingException e) {
            // Lỗi trong quá trình gửi email
            return ResponseEntity.status(500).body("Lỗi khi gửi email: " + e.getMessage());
        } catch (Exception e) {
            // Xử lý các lỗi không mong muốn
            return ResponseEntity.status(500).body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }


    // Xóa thông báo
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(@PathVariable Integer notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok("Notification deleted successfully.");
    }
}
