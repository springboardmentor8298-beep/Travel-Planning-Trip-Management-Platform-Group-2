package com.tripnest.service;

import com.tripnest.dto.activity.ActivityRequest;
import com.tripnest.dto.activity.ActivityResponse;

import java.util.List;

public interface ActivityService {

    List<ActivityResponse> getActivitiesForDay(Long tripId, Long dayId, Long ownerId);

    ActivityResponse addActivity(Long tripId, Long dayId, Long ownerId, ActivityRequest request);

    ActivityResponse updateActivity(Long tripId, Long dayId, Long activityId, Long ownerId, ActivityRequest request);

    void deleteActivity(Long tripId, Long dayId, Long activityId, Long ownerId);
}
