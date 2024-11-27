//package com.API.API.model;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import jakarta.persistence.*;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "event_notifications")
//public class EventNotification {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Integer notificationId;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "eventUserId", nullable = false, foreignKey = @ForeignKey(name = "fk_notification_event_user"))
//    @JsonIgnore
//    private EventUser eventUser;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "customerId", nullable = false, foreignKey = @ForeignKey(name = "fk_notification_customer"))
//    @JsonIgnore
//    private Customer customer;
//
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private NotificationMethod method;
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private NotificationStatus status = NotificationStatus.Pending;
//
//    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
//    private LocalDateTime sentAt = LocalDateTime.now();
//
//    @Column(columnDefinition = "TEXT")
//    private String message;
//
//    // Enum for Notification Method
//    public enum NotificationMethod {
//        Email, SMS, PhoneCall
//    }
//
//    // Enum for Notification Status
//    public enum NotificationStatus {
//        Success, Failed, Pending
//    }
//
//    // Getters and Setters
//    public Integer getNotificationId() {
//        return notificationId;
//    }
//
//    public void setNotificationId(Integer notificationId) {
//        this.notificationId = notificationId;
//    }
//
//    public EventUser getEventUser() {
//        return eventUser;
//    }
//
//    public void setEventUser(EventUser eventUser) {
//        this.eventUser = eventUser;
//    }
//
//    public Customer getCustomer() {
//        return customer;
//    }
//
//    public void setCustomer(Customer customer) {
//        this.customer = customer;
//    }
//
//    public NotificationMethod getMethod() {
//        return method;
//    }
//
//    public void setMethod(NotificationMethod method) {
//        this.method = method;
//    }
//
//    public NotificationStatus getStatus() {
//        return status;
//    }
//
//    public void setStatus(NotificationStatus status) {
//        this.status = status;
//    }
//
//    public LocalDateTime getSentAt() {
//        return sentAt;
//    }
//
//    public void setSentAt(LocalDateTime sentAt) {
//        this.sentAt = sentAt;
//    }
//
//    public String getMessage() {
//        return message;
//    }
//
//    public void setMessage(String message) {
//        this.message = message;
//    }
//}
