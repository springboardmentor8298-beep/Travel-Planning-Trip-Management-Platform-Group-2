package com.tripnest.controller;

import com.tripnest.dto.MessageResponse;
import com.tripnest.entity.Notification;
import com.tripnest.security.UserDetailsImpl;
import com.tripnest.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService =
                notificationService;
    }

    // ==========================================
    // GET ALL NOTIFICATIONS
    // ==========================================

    @GetMapping
    public ResponseEntity<?> getNotifications() {

        UserDetailsImpl user =
                getCurrentUser();

        List<Notification> notifications =
                notificationService
                        .getUserNotifications(
                                user.getId()
                        );

        return ResponseEntity.ok(
                notifications
        );
    }

    // ==========================================
    // GET UNREAD NOTIFICATIONS
    // ==========================================

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications() {

        UserDetailsImpl user =
                getCurrentUser();

        List<Notification> notifications =
                notificationService
                        .getUnreadNotifications(
                                user.getId()
                        );

        return ResponseEntity.ok(
                notifications
        );
    }

    // ==========================================
    // GET UNREAD COUNT
    // ==========================================

    @GetMapping("/count")
    public ResponseEntity<?> getUnreadCount() {

        UserDetailsImpl user =
                getCurrentUser();

        long count =
                notificationService
                        .getUnreadCount(
                                user.getId()
                        );

        return ResponseEntity.ok(count);
    }

    // ==========================================
    // MARK ONE AS READ
    // ==========================================

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id
    ) {

        UserDetailsImpl user =
                getCurrentUser();

        Notification notification =
                notificationService.markAsRead(
                        id,
                        user.getId()
                );

        return ResponseEntity.ok(
                notification
        );
    }

    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {

        UserDetailsImpl user =
                getCurrentUser();

        notificationService.markAllAsRead(
                user.getId()
        );

        return ResponseEntity.ok(
                new MessageResponse(
                        "All notifications marked as read!"
                )
        );
    }

    // ==========================================
    // DELETE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long id
    ) {

        UserDetailsImpl user =
                getCurrentUser();

        notificationService.deleteNotification(
                id,
                user.getId()
        );

        return ResponseEntity.ok(
                new MessageResponse(
                        "Notification deleted successfully!"
                )
        );
    }

    // ==========================================
    // CURRENT USER
    // ==========================================

    private UserDetailsImpl getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (UserDetailsImpl)
                authentication.getPrincipal();
    }
}