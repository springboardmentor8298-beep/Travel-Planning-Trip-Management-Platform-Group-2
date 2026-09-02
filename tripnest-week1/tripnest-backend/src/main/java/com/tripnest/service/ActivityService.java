package com.tripnest.service;

import com.tripnest.dto.ActivityRequest;
import com.tripnest.dto.ActivityResponse;
import com.tripnest.entity.Activity;
import com.tripnest.entity.Itinerary;
import com.tripnest.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ItineraryService itineraryService;

    public ActivityResponse addActivity(String email, Long itineraryId, ActivityRequest request) {
        Itinerary itinerary = itineraryService.findItineraryOrThrow(itineraryId);
        assertHasAccess(email, itinerary);

        Activity activity = Activity.builder()
                .itinerary(itinerary)
                .title(request.getTitle())
                .type(request.getType())
                .scheduledTime(request.getScheduledTime())
                .location(request.getLocation())
                .notes(request.getNotes())
                .build();

        activityRepository.save(activity);
        return toResponse(activity);
    }

    public List<ActivityResponse> getActivitiesForItinerary(String email, Long itineraryId) {
        Itinerary itinerary = itineraryService.findItineraryOrThrow(itineraryId);
        assertHasAccess(email, itinerary);

        return activityRepository.findByItineraryIdOrderByScheduledTimeAsc(itineraryId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ActivityResponse updateActivity(String email, Long activityId, ActivityRequest request) {
        Activity activity = findActivityOrThrow(activityId);
        assertHasAccess(email, activity.getItinerary());

        activity.setTitle(request.getTitle());
        activity.setType(request.getType());
        activity.setScheduledTime(request.getScheduledTime());
        activity.setLocation(request.getLocation());
        activity.setNotes(request.getNotes());

        activityRepository.save(activity);
        return toResponse(activity);
    }

    public void deleteActivity(String email, Long activityId) {
        Activity activity = findActivityOrThrow(activityId);
        assertHasAccess(email, activity.getItinerary());
        activityRepository.delete(activity);
    }

    private Activity findActivityOrThrow(Long activityId) {
        return activityRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found"));
    }

    private void assertHasAccess(String email, Itinerary itinerary) {
        var trip = itinerary.getTrip();
        boolean isOwner = trip.getOwner().getEmail().equalsIgnoreCase(email);
        boolean isTraveler = trip.getTravelers().stream()
                .anyMatch(t -> t.getEmail().equalsIgnoreCase(email));
        if (!isOwner && !isTraveler) {
            throw new AccessDeniedException("You do not have access to this itinerary's activities");
        }
    }

    private ActivityResponse toResponse(Activity a) {
        return new ActivityResponse(
                a.getId(), a.getItinerary().getId(), a.getTitle(), a.getType(),
                a.getScheduledTime(), a.getLocation(), a.getNotes()
        );
    }
}
