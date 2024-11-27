//package com.API.API.controller;
//
//import com.API.API.model.EventNotification;
//import com.API.API.service.EventNotificationService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/notifications")
//public class EventNotificationController {
//
//    @Autowired
//    private EventNotificationService service;
//
//    @GetMapping
//    public ResponseEntity<List<EventNotification>> getAllNotifications() {
//        List<EventNotification> notifications = service.getAllNotifications();
//        return ResponseEntity.ok(notifications);
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<EventNotification> getNotificationById(@PathVariable Integer id) {
//        return service.getNotificationById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    @PostMapping
//    public ResponseEntity<EventNotification> createNotification(@RequestBody EventNotification notification) {
//        EventNotification createdNotification = service.createNotification(notification);
//        return ResponseEntity.ok(createdNotification);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteNotification(@PathVariable Integer id) {
//        service.deleteNotification(id);
//        return ResponseEntity.noContent().build();
//    }
//
//}
