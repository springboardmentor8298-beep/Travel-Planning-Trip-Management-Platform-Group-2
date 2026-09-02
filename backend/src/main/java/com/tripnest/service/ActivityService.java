package com.tripnest.service;

import com.tripnest.entity.Activity;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Notification;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedException;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripMemberRepository tripMemberRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Activity> getActivitiesByItineraryId(Integer itineraryId, String email) {
        User user = getUserByEmail(email);
        getItineraryAndVerifyUser(itineraryId, user);
        return activityRepository.findByItinerary_ItineraryIdOrderByActivityTimeAsc(itineraryId);
    }

    public Activity getActivityById(Integer id, String email) {
        User user = getUserByEmail(email);
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity with ID " + id + " not found"));
        getItineraryAndVerifyUser(activity.getItinerary().getItineraryId(), user);
        return activity;
    }

    public Activity saveActivity(Activity activity, String email) {
        User user = getUserByEmail(email);
        if (activity.getItinerary() == null || activity.getItinerary().getItineraryId() == null) {
            throw new IllegalArgumentException("Itinerary ID is required");
        }
        Itinerary itinerary = getItineraryAndVerifyUser(activity.getItinerary().getItineraryId(), user);
        activity.setItinerary(itinerary);
        if (activity.getStatus() == null || activity.getStatus().trim().isEmpty()) {
            activity.setStatus("PENDING");
        }

        Activity saved = activityRepository.save(activity);

        // Generate ACTIVITY_ADDED notification
        Notification notif = new Notification();
        notif.setUser(user);
        notif.setNotificationTitle("Activity Added");
        notif.setMessage("New activity '" + saved.getActivityName() + "' was added to trip itinerary.");
        notif.setNotificationType("ACTIVITY_ADDED");
        notif.setIsRead(false);
        notif.setCreatedAt(LocalDateTime.now());
        notificationService.saveNotification(notif);

        return saved;
    }

    public Activity updateActivity(Integer id, Activity request, String email) {
        User user = getUserByEmail(email);
        Activity existing = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity with ID " + id + " not found"));
        getItineraryAndVerifyUser(existing.getItinerary().getItineraryId(), user);

        existing.setActivityName(request.getActivityName());
        existing.setActivityType(request.getActivityType());
        existing.setPlaceName(request.getPlaceName());
        existing.setActivityTime(request.getActivityTime());
        existing.setEndTime(request.getEndTime());
        existing.setTimeSlot(request.getTimeSlot());
        existing.setEstimatedCost(request.getEstimatedCost());
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }
        existing.setDescription(request.getDescription());
        existing.setNotes(request.getNotes());
        existing.setDisplayOrder(request.getDisplayOrder());
        existing.setReminder(request.getReminder());

        return activityRepository.save(existing);
    }

    public Activity updateActivityStatus(Integer id, String status, String email) {
        User user = getUserByEmail(email);
        Activity existing = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity with ID " + id + " not found"));
        getItineraryAndVerifyUser(existing.getItinerary().getItineraryId(), user);

        existing.setStatus(status.toUpperCase());
        return activityRepository.save(existing);
    }

    public void reorderActivities(List<Integer> activityIds, String email) {
        User user = getUserByEmail(email);
        for (int i = 0; i < activityIds.size(); i++) {
            Integer id = activityIds.get(i);
            Activity existing = activityRepository.findById(id).orElse(null);
            if (existing != null) {
                getItineraryAndVerifyUser(existing.getItinerary().getItineraryId(), user);
                existing.setDisplayOrder(i + 1);
                activityRepository.save(existing);
            }
        }
    }

    public void deleteActivity(Integer id, String email) {
        User user = getUserByEmail(email);
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity with ID " + id + " not found"));
        getItineraryAndVerifyUser(activity.getItinerary().getItineraryId(), user);
        activityRepository.delete(activity);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + email + " not found"));
    }

    private Itinerary getItineraryAndVerifyUser(Integer itineraryId, User user) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary with ID " + itineraryId + " not found"));
        Trip trip = itinerary.getTrip();
        if (trip == null) {
            throw new ResourceNotFoundException("Trip associated with itinerary " + itineraryId + " not found");
        }

        boolean isOwner = trip.getUser().getUserId().equals(user.getUserId());
        boolean isMember = tripMemberRepository.existsByTrip_TripIdAndUser_UserId(trip.getTripId(), user.getUserId());

        if (!isOwner && !isMember) {
            throw new UnauthorizedException("You are not authorized to access this itinerary");
        }
        return itinerary;
    }
}