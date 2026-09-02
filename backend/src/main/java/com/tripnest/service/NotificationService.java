package com.tripnest.service;

import com.tripnest.entity.Notification;
import com.tripnest.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Optional<Notification> getNotificationById(Integer id) {
        return notificationRepository.findById(id);
    }

    public List<Notification> getNotificationsByUserEmail(String email) {
        return notificationRepository.findByUser_EmailOrderByCreatedAtDesc(email);
    }

    public long getUnreadCountByUserEmail(String email) {
        return notificationRepository.countByUser_EmailAndIsReadFalse(email);
    }

    public Notification markAsRead(Integer id) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            Notification notif = notifOpt.get();
            notif.setIsRead(true);
            return notificationRepository.save(notif);
        }
        return null;
    }

    public void markAllAsRead(String email) {
        List<Notification> userNotifs = notificationRepository.findByUser_EmailOrderByCreatedAtDesc(email);
        for (Notification n : userNotifs) {
            if (Boolean.FALSE.equals(n.getIsRead()) || n.getIsRead() == null) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }

    public Notification saveNotification(Notification notification) {
        if (notification.getIsRead() == null) {
            notification.setIsRead(false);
        }
        return notificationRepository.save(notification);
    }

    public Notification updateNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Integer id) {
        notificationRepository.deleteById(id);
    }
}