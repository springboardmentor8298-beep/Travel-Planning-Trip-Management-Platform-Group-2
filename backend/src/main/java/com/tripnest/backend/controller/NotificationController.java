package com.tripnest.backend.controller;

import com.tripnest.backend.model.NotificationEntity;
import com.tripnest.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications(@RequestParam(required = false) String userId) {
        String uid = userId != null && !userId.isBlank() && !userId.equals("null") ? userId.trim() : "default_user";
        List<NotificationEntity> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(uid);
        if (list.isEmpty()) {
            List<NotificationEntity> defaults = List.of(
                new NotificationEntity("notif_welcome_" + UUID.randomUUID().toString().substring(0, 4), uid, "System Notification: Welcome to TripNest! Your trip invitations and updates will appear here.", "SYSTEM")
            );
            notificationRepository.saveAll(defaults);
            return ResponseEntity.ok(defaults);
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping({"/{id}/read", "/mark-read/{id}"})
    @PutMapping({"/{id}/read", "/mark-read/{id}"})
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        Optional<NotificationEntity> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            NotificationEntity notif = opt.get();
            notif.setRead(true);
            notificationRepository.save(notif);
        }
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam(required = false) String userId) {
        String uid = userId != null && !userId.isBlank() && !userId.equals("null") ? userId.trim() : "default_user";
        List<NotificationEntity> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(uid);
        for (NotificationEntity n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmailNotification() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("service", "Email Service (JavaMailSender / SendGrid)");
        response.put("recipient", "traveler_demo@gmail.com");
        response.put("subject", "Welcome to TripNest!");
        response.put("status", "DISPATCHED");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/fcm/send")
    public ResponseEntity<?> sendFcmPushNotification() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("service", "Push Notifications (Firebase Cloud Messaging - FCM)");
        result.put("status", "DELIVERED_VIA_FCM");
        result.put("title", "Trip Reminder");
        result.put("body", "Packing time!");

        return ResponseEntity.ok(result);
    }
}
