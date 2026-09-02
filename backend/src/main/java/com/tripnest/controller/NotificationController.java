package com.tripnest.controller;

import com.tripnest.entity.Notification;
import com.tripnest.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get notifications for logged-in user or all
    @GetMapping
    public List<Notification> getAllNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null && userDetails.getUsername() != null) {
            return notificationService.getNotificationsByUserEmail(userDetails.getUsername());
        }
        return notificationService.getAllNotifications();
    }

    // Get unread notification count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        long count = email != null ? notificationService.getUnreadCountByUserEmail(email) : 0L;
        return ResponseEntity.ok(Collections.singletonMap("unreadCount", count));
    }

    // Mark single notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Integer id) {
        Notification updated = notificationService.markAsRead(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // Mark all notifications as read
    @PutMapping("/mark-all-read")
    public ResponseEntity<String> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null && userDetails.getUsername() != null) {
            notificationService.markAllAsRead(userDetails.getUsername());
        }
        return ResponseEntity.ok("All notifications marked as read!");
    }

    // Get notification by ID
    @GetMapping("/{id}")
    public Optional<Notification> getNotificationById(@PathVariable Integer id) {
        return notificationService.getNotificationById(id);
    }

    // Create notification
    @PostMapping
    public Notification saveNotification(@RequestBody Notification notification) {
        return notificationService.saveNotification(notification);
    }

    // Update notification
    @PutMapping("/{id}")
    public Notification updateNotification(@PathVariable Integer id,
                                           @RequestBody Notification notification) {

        notification.setNotificationId(id);
        return notificationService.updateNotification(notification);
    }

    // Delete notification
    @DeleteMapping("/{id}")
    public String deleteNotification(@PathVariable Integer id) {

        notificationService.deleteNotification(id);
        return "Notification deleted successfully!";
    }
}