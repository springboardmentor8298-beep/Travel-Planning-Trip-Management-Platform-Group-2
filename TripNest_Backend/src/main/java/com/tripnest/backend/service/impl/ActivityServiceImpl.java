package com.tripnest.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateActivityRequest;
import com.tripnest.backend.dto.response.ActivityResponse;
import com.tripnest.backend.entity.Activity;
import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.ActivityRepository;
import com.tripnest.backend.repository.ItineraryRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.ActivityService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;

    @Override
    public ApiResponse<ActivityResponse> createActivity(
            Long itineraryId,
            CreateActivityRequest request) {
    	Itinerary itinerary = itineraryRepository.findById(itineraryId)
    	        .orElseThrow(() ->
    	                new ResourceNotFoundException("Itinerary not found"));

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
            CreateActivityRequest request) {

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Activity not found"));

        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setActivityTime(request.getActivityTime());
        activity.setActivityType(request.getActivityType());

        activityRepository.save(activity);

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

        activityRepository.delete(activity);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Activity deleted successfully")
                .data("Activity deleted successfully")
                .build();
    }
}