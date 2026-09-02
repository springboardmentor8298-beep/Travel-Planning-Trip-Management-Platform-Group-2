package com.tripnest.controller;

import com.tripnest.dto.ActivityRequest;
import com.tripnest.dto.ActivityResponse;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping("/api/itineraries/{itineraryId}/activities")
    public ResponseEntity<ActivityResponse> addActivity(@PathVariable Long itineraryId,
                                                         @Valid @RequestBody ActivityRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(activityService.addActivity(email, itineraryId, request));
    }

    @GetMapping("/api/itineraries/{itineraryId}/activities")
    public ResponseEntity<List<ActivityResponse>> getActivities(@PathVariable Long itineraryId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(activityService.getActivitiesForItinerary(email, itineraryId));
    }

    @PutMapping("/api/activities/{activityId}")
    public ResponseEntity<ActivityResponse> updateActivity(@PathVariable Long activityId,
                                                            @Valid @RequestBody ActivityRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(activityService.updateActivity(email, activityId, request));
    }

    @DeleteMapping("/api/activities/{activityId}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long activityId) {
        String email = SecurityUtils.getCurrentUserEmail();
        activityService.deleteActivity(email, activityId);
        return ResponseEntity.noContent().build();
    }
}
