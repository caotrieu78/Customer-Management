package com.API.API.dto;

import com.API.API.model.Customer;
import com.API.API.model.User;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventNotificationDTO {
    private Integer notificationId;
    private String method;
    private String status;
    private LocalDateTime sentAt;
    private String message;
    private String attachmentPath;

    private User user;         // Thông tin người phụ trách
    private Customer customer; // Thông tin khách hàng

    public EventNotificationDTO() {
    }

    public EventNotificationDTO(Integer notificationId, String method, String status, LocalDateTime sentAt,
                                String message, String attachmentPath, User user, Customer customer) {
        this.notificationId = notificationId;
        this.method = method;
        this.status = status;
        this.sentAt = sentAt;
        this.message = message;
        this.attachmentPath = attachmentPath;
        this.user = user;
        this.customer = customer;
    }

    // Getters and Setters
    public Integer getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Integer notificationId) {
        this.notificationId = notificationId;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAttachmentPath() {
        return attachmentPath;
    }

    public void setAttachmentPath(String attachmentPath) {
        this.attachmentPath = attachmentPath;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}
