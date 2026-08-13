package com.tripnest.service;

import com.tripnest.model.Notification;
import com.tripnest.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification saveNotification(Notification notification) {
        if (notification.getStatus() == null) {
            notification.setStatus("UNREAD");
        }
        return notificationRepository.save(notification);
    }

    public Notification createNotification(String message) {
        Notification notification = new Notification(message, "UNREAD");
        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification markAsRead(Integer id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setStatus("READ");
            return notificationRepository.save(notification);
        }).orElse(null);
    }

    public void markAllAsRead() {
        List<Notification> list = notificationRepository.findAll();
        for (Notification n : list) {
            n.setStatus("READ");
        }
        notificationRepository.saveAll(list);
    }
}