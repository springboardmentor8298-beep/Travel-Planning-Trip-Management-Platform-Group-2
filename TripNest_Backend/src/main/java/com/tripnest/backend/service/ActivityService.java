package com.tripnest.backend.service;

import java.util.List;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateActivityRequest;
import com.tripnest.backend.dto.response.ActivityResponse;

public interface ActivityService {

    ApiResponse<ActivityResponse> createActivity(
            Long itineraryId,
            CreateActivityRequest request);

    ApiResponse<List<ActivityResponse>> getActivities(
            Long itineraryId);

    ApiResponse<ActivityResponse> updateActivity(
            Long activityId,
            CreateActivityRequest request);

    ApiResponse<String> deleteActivity(
            Long activityId);

}