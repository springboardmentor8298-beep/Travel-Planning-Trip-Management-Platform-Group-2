package com.tripnest.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateActivityRequest;
import com.tripnest.backend.dto.response.ActivityResponse;
import com.tripnest.backend.service.ActivityService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/itineraries")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping("/{itineraryId}/activities")
    public ApiResponse<ActivityResponse> createActivity(
            @PathVariable Long itineraryId,
            @Valid @RequestBody CreateActivityRequest request) {

        return activityService.createActivity(itineraryId, request);
    }

    @GetMapping("/{itineraryId}/activities")
    public ApiResponse<List<ActivityResponse>> getActivities(
            @PathVariable Long itineraryId) {

        return activityService.getActivities(itineraryId);
    }

    @PutMapping("/activities/{activityId}")
    public ApiResponse<ActivityResponse> updateActivity(
            @PathVariable Long activityId,
            @Valid @RequestBody CreateActivityRequest request) {

        return activityService.updateActivity(activityId, request);
    }

    @DeleteMapping("/activities/{activityId}")
    public ApiResponse<String> deleteActivity(
            @PathVariable Long activityId) {

        return activityService.deleteActivity(activityId);
    }
}