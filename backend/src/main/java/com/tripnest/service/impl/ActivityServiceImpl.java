package com.tripnest.service.impl;

import com.tripnest.dto.activity.ActivityRequest;
import com.tripnest.dto.activity.ActivityResponse;
import com.tripnest.entity.Activity;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import com.tripnest.exception.InvalidRequestException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.ScheduleConflictException;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivitiesForDay(Long tripId, Long dayId, Long ownerId) {
        findDay(tripId, dayId, ownerId);
        return activityRepository.findByItineraryIdOrderByStartTimeAsc(dayId).stream()
                .map(ActivityResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public ActivityResponse addActivity(Long tripId, Long dayId, Long ownerId, ActivityRequest request) {
        Itinerary day = findDay(tripId, dayId, ownerId);
        validateTimeRange(request.getStartTime(), request.getEndTime());
        assertNoConflict(dayId, null, request.getStartTime(), request.getEndTime());

        Activity activity = new Activity();
        activity.setItinerary(day);
        applyRequest(activity, request);

        return ActivityResponse.fromEntity(activityRepository.save(activity));
    }

    @Override
    @Transactional
    public ActivityResponse updateActivity(Long tripId, Long dayId, Long activityId, Long ownerId,
                                            ActivityRequest request) {
        findDay(tripId, dayId, ownerId);
        Activity activity = findActivity(dayId, activityId);
        validateTimeRange(request.getStartTime(), request.getEndTime());
        assertNoConflict(dayId, activityId, request.getStartTime(), request.getEndTime());

        applyRequest(activity, request);
        return ActivityResponse.fromEntity(activityRepository.save(activity));
    }

    @Override
    @Transactional
    public void deleteActivity(Long tripId, Long dayId, Long activityId, Long ownerId) {
        findDay(tripId, dayId, ownerId);
        Activity activity = findActivity(dayId, activityId);
        activityRepository.delete(activity);
    }

    private void applyRequest(Activity activity, ActivityRequest request) {
        activity.setTitle(request.getTitle());
        activity.setActivityType(request.getActivityType());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocation(request.getLocation());
        activity.setEstimatedCost(request.getEstimatedCost());
        activity.setNotes(request.getNotes());
        activity.setReminderEnabled(request.isReminderEnabled());
    }

    private void validateTimeRange(LocalTime start, LocalTime end) {
        if (start != null && end != null && !end.isAfter(start)) {
            throw new InvalidRequestException("Activity end time must be after its start time");
        }
    }

    /** Rejects overlapping time windows within the same itinerary day. */
    private void assertNoConflict(Long dayId, Long excludingActivityId, LocalTime start, LocalTime end) {
        if (start == null || end == null) {
            return;
        }

        boolean conflict = activityRepository.findByItineraryIdOrderByStartTimeAsc(dayId).stream()
                .filter(existing -> !existing.getId().equals(excludingActivityId))
                .filter(existing -> existing.getStartTime() != null && existing.getEndTime() != null)
                .anyMatch(existing -> start.isBefore(existing.getEndTime()) && existing.getStartTime().isBefore(end));

        if (conflict) {
            throw new ScheduleConflictException(
                    "This activity overlaps with another activity already scheduled on this day");
        }
    }

    private Itinerary findDay(Long tripId, Long dayId, Long ownerId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        if (!trip.getOwner().getId().equals(ownerId)) {
            throw new AccessDeniedException("You do not have permission to access this trip");
        }
        return itineraryRepository.findByIdAndTripId(dayId, tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found with id: " + dayId));
    }

    private Activity findActivity(Long dayId, Long activityId) {
        return activityRepository.findByIdAndItineraryId(activityId, dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + activityId));
    }
}
