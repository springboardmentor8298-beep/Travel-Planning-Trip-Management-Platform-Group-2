package com.tripnest.service;

import com.tripnest.entity.Notification;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.NotificationRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            TripRepository tripRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
    }

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================

    public Notification createNotification(
            Long userId,
            Long tripId,
            String message,
            String type
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Trip trip = null;

        if (tripId != null) {
            trip = tripRepository.findById(tripId)
                    .orElseThrow(() ->
                            new RuntimeException("Trip not found")
                    );
        }

        Notification notification =
                new Notification();

        notification.setUser(user);
        notification.setTrip(trip);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);

        return notificationRepository.save(
                notification
        );
    }

    // ==========================================
    // GET USER NOTIFICATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(
            Long userId
    ) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                );
    }

    // ==========================================
    // GET UNREAD NOTIFICATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(
            Long userId
    ) {

        return notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
                        userId
                );
    }

    // ==========================================
    // UNREAD COUNT
    // ==========================================

    public long getUnreadCount(Long userId) {

        return notificationRepository
                .countByUserIdAndIsReadFalse(
                        userId
                );
    }

    // ==========================================
    // MARK AS READ
    // ==========================================

    public Notification markAsRead(
            Long notificationId,
            Long userId
    ) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );

        if (!notification.getUser()
                .getId()
                .equals(userId)) {

            throw new RuntimeException(
                    "You do not have access to this notification"
            );
        }

        notification.setRead(true);

        return notificationRepository.save(
                notification
        );
    }

    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    public void markAllAsRead(Long userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
                                userId
                        );

        for (Notification notification :
                notifications) {

            notification.setRead(true);
        }

        notificationRepository.saveAll(
                notifications
        );
    }

    // ==========================================
    // DELETE NOTIFICATION
    // ==========================================

    public void deleteNotification(
            Long notificationId,
            Long userId
    ) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );

        if (!notification.getUser()
                .getId()
                .equals(userId)) {

            throw new RuntimeException(
                    "You do not have access to this notification"
            );
        }

        notificationRepository.delete(
                notification
        );
    }
}