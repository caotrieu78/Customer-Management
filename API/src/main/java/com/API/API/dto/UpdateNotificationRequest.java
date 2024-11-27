package com.API.API.dto;

import java.time.LocalDateTime;

public class UpdateNotificationRequest {
    private String message;
    private LocalDateTime sentAt;

    // Getters và Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}
