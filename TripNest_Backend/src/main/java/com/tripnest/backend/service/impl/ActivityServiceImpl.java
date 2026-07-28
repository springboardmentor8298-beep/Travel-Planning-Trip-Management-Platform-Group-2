package com.tripnest.backend.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateActivityRequest;
import com.tripnest.backend.dto.UpdateActivityRequest;
import com.tripnest.backend.dto.response.ActivityResponse;
import com.tripnest.backend.entity.Activity;
import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.ActivityRepository;
import com.tripnest.backend.repository.ItineraryRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.ActivityService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    
    @Override
    @Transactional
    public ApiResponse<ActivityResponse> createActivity(
            Long tripId,
            Integer dayNumber,
            CreateActivityRequest request) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trip not found"));

        validateTripOwnership(trip);

        Itinerary itinerary = itineraryRepository
                .findByTripAndDayNumber(trip, dayNumber)
                .orElseGet(() -> {

                    Itinerary newItinerary = Itinerary.builder()
                            .trip(trip)
                            .dayNumber(dayNumber)
                            .date(trip.getStartDate().plusDays(dayNumber - 1))
                            .build();

                    return itineraryRepository.save(newItinerary);
                });

        Activity activity = Activity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .activityTime(request.getActivityTime())
                .activityType(request.getActivityType())
                .itinerary(itinerary)
                .build();

        activity = activityRepository.save(activity);

        ActivityResponse response = ActivityResponse.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .description(activity.getDescription())
                .activityTime(activity.getActivityTime())
                .activityType(activity.getActivityType())
                .build();

        return ApiResponse.<ActivityResponse>builder()
                .success(true)
                .message("Activity created successfully")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<List<ActivityResponse>> getActivities(
            Long itineraryId) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Itinerary not found"));

        validateTripOwnership(itinerary.getTrip());

        List<ActivityResponse> response = activityRepository
                .findByItineraryOrderByActivityTimeAsc(itinerary)
                .stream()
                .map(activity -> ActivityResponse.builder()
                        .id(activity.getId())
                        .title(activity.getTitle())
                        .description(activity.getDescription())
                        .activityTime(activity.getActivityTime())
                        .activityType(activity.getActivityType())
                        .build())
                .toList();

        return ApiResponse.<List<ActivityResponse>>builder()
                .success(true)
                .message("Activities fetched successfully")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<ActivityResponse> updateActivity(
            Long activityId,
            UpdateActivityRequest request) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Activity not found"));

        validateTripOwnership(activity.getItinerary().getTrip());

        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setActivityTime(request.getActivityTime());
        activity.setActivityType(request.getActivityType());

        activity = activityRepository.save(activity);

        ActivityResponse response = ActivityResponse.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .description(activity.getDescription())
                .activityTime(activity.getActivityTime())
                .activityType(activity.getActivityType())
                .build();

        return ApiResponse.<ActivityResponse>builder()
                .success(true)
                .message("Activity updated successfully")
                .data(response)
                .build();
    }


    @Override
    public ApiResponse<String> deleteActivity(
            Long activityId) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Activity not found"));

        validateTripOwnership(activity.getItinerary().getTrip());

        activityRepository.delete(activity);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Activity deleted successfully")
                .data("Activity deleted successfully")
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    private void validateTripOwnership(Trip trip) {
        User currentUser = getCurrentUser();
        if (!trip.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this trip.");
        }
    }
}