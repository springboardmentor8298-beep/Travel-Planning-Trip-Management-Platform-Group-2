package com.tripnest.controller;

import com.tripnest.entity.Notification;
import com.tripnest.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Notification>> getUserNotifications(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }
}
