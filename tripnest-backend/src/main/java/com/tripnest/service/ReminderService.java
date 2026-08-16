package com.tripnest.service;

import com.tripnest.entity.*;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Background jobs for Notification System requirements: "Trip reminders"
 * and "Activity reminders". Both run on a fixed schedule and use a
 * reminderSent flag on the entity to guarantee each trip/activity is only
 * notified once, even though the job re-runs periodically.
 *
 * Intervals are short (minutes) so this is demoable without waiting a full
 * day - see the comment on each @Scheduled annotation for the production
 * equivalent.
 *
 * @Transactional at the class level matters here specifically because
 * @Scheduled methods run on a background thread with NO Hibernate session
 * attached (unlike a normal HTTP request, which gets one automatically via
 * Spring's open-session-in-view). Without an open transaction, any lazy
 * association accessed here - trip.getTravelers() (lazy @ManyToMany), and
 * activity.getItinerary().getTrip() (two lazy @ManyToOne hops) - throws
 * LazyInitializationException the moment it's touched outside a session.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderService.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final NotificationService notificationService;

    // Every 5 minutes for demo purposes. In production this would be a
    // daily cron, e.g. @Scheduled(cron = "0 0 8 * * *") for 8 AM daily.
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void sendTripReminders() {
        LocalDate today = LocalDate.now();
        LocalDate reminderWindowEnd = today.plusDays(3);

        List<Trip> upcomingTrips = tripRepository.findByStartDateBetweenAndReminderSentFalse(today, reminderWindowEnd);

        for (Trip trip : upcomingTrips) {
            if (trip.getStatus() == TripStatus.CANCELLED) {
                continue;
            }

            String message = "Your trip \"" + trip.getTitle() + "\" starts on "
                    + trip.getStartDate().format(DATE_FMT) + ". Time to finish planning!";

            for (User recipient : allMembersOf(trip)) {
                notificationService.send(recipient, NotificationType.TRIP_REMINDER, message, trip.getId());
            }

            trip.setReminderSent(true);
            tripRepository.save(trip);
            log.info("Sent trip reminder for trip {} ({})", trip.getId(), trip.getTitle());
        }
    }

    // Every 5 minutes for demo purposes. In production this would run once
    // daily, early morning, to remind people of that day's activities.
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void sendActivityReminders() {
        LocalDate today = LocalDate.now();

        List<Activity> todaysActivities = activityRepository.findByItineraryDateAndReminderSentFalse(today);

        for (Activity activity : todaysActivities) {
            Trip trip = activity.getItinerary().getTrip();

            String timePart = activity.getScheduledTime() != null
                    ? " at " + activity.getScheduledTime()
                    : "";
            String message = "Reminder: \"" + activity.getTitle() + "\"" + timePart
                    + " today for trip \"" + trip.getTitle() + "\".";

            for (User recipient : allMembersOf(trip)) {
                notificationService.send(recipient, NotificationType.ACTIVITY_REMINDER, message, trip.getId());
            }

            activity.setReminderSent(true);
            activityRepository.save(activity);
            log.info("Sent activity reminder for activity {} ({})", activity.getId(), activity.getTitle());
        }
    }

    private Set<User> allMembersOf(Trip trip) {
        Set<User> members = new HashSet<>();
        members.add(trip.getOwner());
        members.addAll(trip.getTravelers());
        return members;
    }
}
