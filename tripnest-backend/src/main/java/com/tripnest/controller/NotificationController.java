package com.tripnest.controller;

import com.tripnest.model.Notification;
import com.tripnest.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/add")
    public Notification addNotification(@RequestBody Notification notification) {
        return notificationService.saveNotification(notification);
    }

    @GetMapping("/all")
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    @PutMapping("/mark-read/{id}")
    public Notification markAsRead(@PathVariable Integer id) {
        return notificationService.markAsRead(id);
    }

    @PutMapping("/mark-all-read")
    public String markAllAsRead() {
        notificationService.markAllAsRead();
        return "All notifications marked as READ";
    }
}