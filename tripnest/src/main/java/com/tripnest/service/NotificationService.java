package com.tripnest.service;

import com.tripnest.dto.NotificationResponse;
import com.tripnest.entity.Notification;
import com.tripnest.entity.User;
import com.tripnest.repository.NotificationRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public Notification createNotification(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setUser(user);

        return notificationRepository.save(notification);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public Notification getNotification(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        try {
            return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                    .stream().map(this::mapToResponse).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching user notifications: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        try {
            return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                    .stream().map(this::mapToResponse).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching unread notifications: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    public long getUnreadCount(Long userId) {
        try {
            return notificationRepository.countByUserIdAndIsReadFalse(userId);
        } catch (Exception e) {
            System.err.println("Error fetching unread count: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }

    public NotificationResponse mapToResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt(),
                n.getRelatedTripId(),
                n.getUser() != null ? n.getUser().getId() : null
        );
    }
}

