package com.API.API.controller;

import com.API.API.dto.ResponseMessage;
import com.API.API.dto.UpdateNotificationRequest;
import com.API.API.model.EventNotification;
import com.API.API.service.EventNotificationService;
import com.API.API.service.FileUploadService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class EventNotificationController {

    @Autowired
    private EventNotificationService notificationService;

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Lấy tất cả thông báo (bao gồm tự động tạo thông báo nếu chưa tồn tại).
     */
    @GetMapping
    public ResponseEntity<List<EventNotification>> getAllNotifications() {
        List<EventNotification> notifications = notificationService.getAllNotificationsWithEventUserIds();
        return ResponseEntity.ok(notifications);
    }

    /**
     * Lấy chi tiết một thông báo theo ID.
     */
    @GetMapping("/{notificationId}")
    public ResponseEntity<EventNotification> getNotificationById(@PathVariable Integer notificationId) {
        EventNotification notification = notificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(notification);
    }

    /**
     * Lấy nội dung mẫu cho một thông báo.
     */
    @GetMapping("/{notificationId}/content")
    public ResponseEntity<String> getNotificationContent(@PathVariable Integer notificationId) {
        try {
            EventNotification notification = notificationService.getNotificationById(notificationId);
            String template = notificationService.getNotificationTemplate(notification);
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Đã xảy ra lỗi khi lấy nội dung mẫu: " + e.getMessage());
        }
    }

    /**
     * Gửi thông báo (cho phép đính kèm file).
     */
    @PutMapping("/{notificationId}/send")
    public ResponseEntity<?> sendNotification(
            @PathVariable Integer notificationId,
            @RequestParam String message,
            @RequestParam String sentAt,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments) {
        try {
            // Parse thời gian gửi từ chuỗi sang LocalDateTime
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            LocalDateTime parsedSentAt = LocalDateTime.parse(sentAt, formatter);

            // Xử lý tệp đính kèm
            List<String> attachmentPaths = new ArrayList<>();
            if (attachments != null && !attachments.isEmpty()) {
                for (MultipartFile attachment : attachments) {
                    String filePath = fileUploadService.uploadFile(attachment);
                    attachmentPaths.add(filePath);
                }
            }

            // Chuẩn bị yêu cầu gửi thông báo
            UpdateNotificationRequest request = new UpdateNotificationRequest();
            request.setMessage(message);
            request.setSentAt(parsedSentAt);
            request.setAttachmentPaths(attachmentPaths);

            // Gửi thông báo
            EventNotification updatedNotification = notificationService.sendNotification(notificationId, request, attachmentPaths);

            // Phản hồi thành công
            return ResponseEntity.ok(new ResponseMessage("Thông báo đã gửi thành công", updatedNotification));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Dữ liệu không hợp lệ: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("Lỗi khi gửi email: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }

    /**
     * Xóa một thông báo.
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(@PathVariable Integer notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok("Thông báo đã được xóa thành công.");
    }
}
