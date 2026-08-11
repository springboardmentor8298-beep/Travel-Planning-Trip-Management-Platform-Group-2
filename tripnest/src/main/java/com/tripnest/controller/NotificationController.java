package com.tripnest.controller;

import com.tripnest.dto.NotificationResponse;
import com.tripnest.entity.User;
import com.tripnest.repository.UserRepository;
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
    private final UserRepository userRepository;

    private User resolveUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    @GetMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(Authentication authentication) {
        try {
            User user = resolveUser(authentication);
            List<NotificationResponse> notifications = notificationService.getUserNotifications(user.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error in getUserNotifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/unread")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(Authentication authentication) {
        try {
            User user = resolveUser(authentication);
            List<NotificationResponse> notifications = notificationService.getUnreadNotifications(user.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error in getUnreadNotifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        try {
            User user = resolveUser(authentication);
            long count = notificationService.getUnreadCount(user.getId());
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            System.err.println("Error in getUnreadCount: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(0L);
        }
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
        try {
            User user = resolveUser(authentication);
            notificationService.markAllAsRead(user.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error in markAllAsRead: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to mark all as read: " + e.getMessage());
        }
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }
}
