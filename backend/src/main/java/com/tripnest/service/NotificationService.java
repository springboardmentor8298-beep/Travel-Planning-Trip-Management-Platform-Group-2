package com.tripnest.service;

import com.tripnest.dto.NotificationRequest;
import com.tripnest.dto.NotificationResponse;
import com.tripnest.entity.Notification;
import com.tripnest.entity.User;
import com.tripnest.repository.NotificationRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<NotificationResponse> getMyNotifications() {
        User user = getCurrentUserOrDefault();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse).toList();
    }

    public long getUnreadCount() {
        User user = getCurrentUserOrDefault();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    public NotificationResponse createNotification(NotificationRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseGet(this::getCurrentUserOrDefault);
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(request.getType() != null ? request.getType() : "INFO");
        notification.setTitle(request.getTitle() != null ? request.getTitle() : "Notification");
        notification.setMessage(request.getMessage() != null ? request.getMessage() : "");
        notification.setTripId(request.getTripId());
        return toResponse(notificationRepository.save(notification));
    }

    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        return toResponse(notificationRepository.save(notification));
    }

    public void markAllAsRead() {
        User user = getCurrentUserOrDefault();
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        notifications.forEach(n -> {
            if (!n.getIsRead()) {
                n.setIsRead(true);
                n.setReadAt(LocalDateTime.now());
            }
        });
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.delete(notification);
    }

    public NotificationResponse createNotificationForDefaultUser(NotificationRequest request) {
        User user = getCurrentUserOrDefault();
        return createNotification(request, user.getId());
    }

    private User getCurrentUserOrDefault() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                return (User) auth.getPrincipal();
            }
        } catch (Exception ignored) {}
        return userRepository.findByEmail("traveler@tripnest.com").orElseGet(() ->
                userRepository.findAll().stream().findFirst().orElseThrow(() ->
                        new RuntimeException("No default user found. Please restart application to seed users."))
        );
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getUser().getId(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.getTripId(),
                n.getIsRead(),
                n.getReadAt(),
                n.getCreatedAt()
        );
    }
}
