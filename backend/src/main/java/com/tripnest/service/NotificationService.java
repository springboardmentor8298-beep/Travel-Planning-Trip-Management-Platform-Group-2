package com.tripnest.service;

import com.tripnest.dto.NotificationResponse;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.Notification;
import com.tripnest.model.User;
import com.tripnest.repository.NotificationRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final UserRepository         userRepo;

    public NotificationService(NotificationRepository notifRepo, UserRepository userRepo) {
        this.notifRepo = notifRepo;
        this.userRepo  = userRepo;
    }

    /* ── Create (used internally by other services) ── */
    public void create(User user, Notification.Type type,
                       String title, String message, String actionUrl) {
        Notification n = new Notification(user, type, title, message, actionUrl);
        notifRepo.save(n);
    }

    /** Create a notification addressed to a user by email — safe, skips unknown emails */
    public void createForEmail(String email, Notification.Type type,
                               String title, String message, String actionUrl) {
        userRepo.findByEmail(email.toLowerCase()).ifPresent(user ->
            create(user, type, title, message, actionUrl)
        );
    }

    /* ── Query ── */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAll(String email) {
        User user = findUser(email);
        return notifRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(NotificationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnread(String email) {
        User user = findUser(email);
        return notifRepo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId())
                .stream().map(NotificationResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = findUser(email);
        return notifRepo.countByUserIdAndIsReadFalse(user.getId());
    }

    /* ── Actions ── */
    public NotificationResponse markRead(String email, Long notifId) {
        Notification n = notifRepo.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getUser().getEmail().equalsIgnoreCase(email))
            throw new IllegalArgumentException("Not your notification");
        n.setRead(true);
        return NotificationResponse.fromEntity(notifRepo.save(n));
    }

    public void markAllRead(String email) {
        User user = findUser(email);
        notifRepo.markAllReadForUser(user.getId());
    }

    /* ── Helper ── */
    private User findUser(String email) {
        return userRepo.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
