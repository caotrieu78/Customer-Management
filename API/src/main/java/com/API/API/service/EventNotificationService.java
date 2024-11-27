//package com.API.API.service;
//
//import com.API.API.model.EventNotification;
//import com.API.API.repository.EventNotificationRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class EventNotificationService {
//
//    @Autowired
//    private EventNotificationRepository repository;
//
//    public List<EventNotification> getAllNotifications() {
//        return repository.findAll();
//    }
//
//    public Optional<EventNotification> getNotificationById(Integer id) {
//        return repository.findById(id);
//    }
//
//    public EventNotification createNotification(EventNotification notification) {
//        return repository.save(notification);
//    }
//
//    public void deleteNotification(Integer id) {
//        repository.deleteById(id);
//    }
//}
