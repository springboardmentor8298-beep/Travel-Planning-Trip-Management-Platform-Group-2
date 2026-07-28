package com.tripnest.backend.service;

import java.util.List;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateActivityRequest;
import com.tripnest.backend.dto.UpdateActivityRequest;
import com.tripnest.backend.dto.response.ActivityResponse;

import jakarta.validation.Valid;

public interface ActivityService {

    ApiResponse<ActivityResponse> createActivity(Long tripId, Integer dayNumber,
            CreateActivityRequest request);

    ApiResponse<List<ActivityResponse>> getActivities(
            Long itineraryId);

    ApiResponse<ActivityResponse> updateActivity(
            Long activityId,
            @Valid UpdateActivityRequest request);

    ApiResponse<String> deleteActivity(
            Long activityId);

}