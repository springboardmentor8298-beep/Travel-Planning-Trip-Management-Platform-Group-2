package com.tripnest.controller;

import com.tripnest.dto.ActivityRequest;
import com.tripnest.dto.ActivityResponse;
import com.tripnest.entity.User;
import com.tripnest.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/itineraries/{itineraryId}/activities")
@CrossOrigin(origins = "*")
public class ActivityController {
    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping
    public ResponseEntity<ActivityResponse> createActivity(@PathVariable Long tripId, @PathVariable Long itineraryId, @RequestBody ActivityRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(activityService.createActivity(tripId, itineraryId, request, user));
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getItineraryActivities(@PathVariable Long tripId, @PathVariable Long itineraryId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(activityService.getItineraryActivities(tripId, itineraryId, user));
    }

    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> getActivityById(@PathVariable Long tripId, @PathVariable Long itineraryId, @PathVariable Long activityId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(activityService.getActivityById(tripId, itineraryId, activityId, user));
    }

    @PutMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> updateActivity(@PathVariable Long tripId, @PathVariable Long itineraryId, @PathVariable Long activityId, @RequestBody ActivityRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(activityService.updateActivity(tripId, itineraryId, activityId, request, user));
    }

    @DeleteMapping("/{activityId}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long tripId, @PathVariable Long itineraryId, @PathVariable Long activityId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        activityService.deleteActivity(tripId, itineraryId, activityId, user);
        return ResponseEntity.noContent().build();
    }
}
