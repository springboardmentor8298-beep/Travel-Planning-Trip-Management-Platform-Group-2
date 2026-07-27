package com.tripnest.controller;

import com.tripnest.dto.activity.ActivityRequest;
import com.tripnest.dto.activity.ActivityResponse;
import com.tripnest.dto.response.ApiResponse;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trips/{tripId}/itinerary/{dayId}/activities")
@RequiredArgsConstructor
@Tag(name = "Activities", description = "Activity scheduling within an itinerary day")
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    @Operation(summary = "List activities scheduled for an itinerary day")
    public ApiResponse<List<ActivityResponse>> getActivities(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @PathVariable Long dayId) {
        return ApiResponse.success(activityService.getActivitiesForDay(tripId, dayId, principal.getId()));
    }

    @PostMapping
    @Operation(summary = "Schedule a new activity on an itinerary day")
    public ResponseEntity<ApiResponse<ActivityResponse>> addActivity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @PathVariable Long dayId,
            @Valid @RequestBody ActivityRequest request) {
        ActivityResponse response = activityService.addActivity(tripId, dayId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Activity scheduled"));
    }

    @PutMapping("/{activityId}")
    @Operation(summary = "Update a scheduled activity")
    public ApiResponse<ActivityResponse> updateActivity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @PathVariable Long dayId,
            @PathVariable Long activityId,
            @Valid @RequestBody ActivityRequest request) {
        return ApiResponse.success(
                activityService.updateActivity(tripId, dayId, activityId, principal.getId(), request),
                "Activity updated");
    }

    @DeleteMapping("/{activityId}")
    @Operation(summary = "Remove a scheduled activity")
    public ApiResponse<Void> deleteActivity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @PathVariable Long dayId,
            @PathVariable Long activityId) {
        activityService.deleteActivity(tripId, dayId, activityId, principal.getId());
        return ApiResponse.success(null, "Activity removed");
    }
}
