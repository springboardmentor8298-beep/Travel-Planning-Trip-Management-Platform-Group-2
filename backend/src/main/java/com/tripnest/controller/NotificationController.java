package com.tripnest.controller;

import com.tripnest.dto.NotificationResponse;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notifService;

    public NotificationController(NotificationService notifService) {
        this.notifService = notifService;
    }

    /** All notifications for the current user */
    @GetMapping
    public List<NotificationResponse> getAll(
            @AuthenticationPrincipal UserPrincipal principal) {
        return notifService.getAll(principal.getUsername());
    }

    /** Only unread notifications */
    @GetMapping("/unread")
    public List<NotificationResponse> getUnread(
            @AuthenticationPrincipal UserPrincipal principal) {
        return notifService.getUnread(principal.getUsername());
    }

    /** Count of unread notifications — used by the navbar bell badge */
    @GetMapping("/unread/count")
    public Map<String, Long> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        long count = notifService.getUnreadCount(principal.getUsername());
        // Return both as a number AND as plain body so the frontend can parse either
        return Map.of("count", count);
    }

    /** Mark a single notification as read */
    @PutMapping("/{id}/read")
    public NotificationResponse markRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return notifService.markRead(principal.getUsername(), id);
    }

    /** Mark ALL notifications as read */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        notifService.markAllRead(principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
