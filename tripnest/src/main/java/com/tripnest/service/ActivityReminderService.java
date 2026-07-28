package com.tripnest.service;

import com.tripnest.entity.Activity;
import com.tripnest.entity.Notification;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ActivityReminderService {
    private final ActivityRepository activities;
    private final NotificationRepository notifications;

    public ActivityReminderService(ActivityRepository activities, NotificationRepository notifications) {
        this.activities = activities;
        this.notifications = notifications;
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void sendDueActivityReminders() {
        for (Activity activity : activities.findByReminderAtBeforeAndReminderSentAtIsNull(LocalDateTime.now())) {
            String tripName = activity.getItinerary().getTrip().getTripName();
            Notification notification = new Notification();
            notification.setTitle("Activity reminder");
            notification.setMessage(activity.getActivityName() + " is coming up for " + tripName + ".");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setUser(activity.getItinerary().getTrip().getUser());
            notifications.save(notification);
            activity.setReminderSentAt(LocalDateTime.now());
        }
    }
}
