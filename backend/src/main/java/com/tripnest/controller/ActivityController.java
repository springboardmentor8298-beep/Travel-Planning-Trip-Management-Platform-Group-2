package com.tripnest.controller;

import com.tripnest.entity.Activity;
import com.tripnest.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    // Get activities for a specific itinerary day
    @GetMapping
    public ResponseEntity<List<Activity>> getActivitiesByItinerary(
            @RequestParam("itineraryId") Integer itineraryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Activity> activities = activityService.getActivitiesByItineraryId(itineraryId, userDetails.getUsername());
        return ResponseEntity.ok(activities);
    }

    // Get activity by ID
    @GetMapping("/{id}")
    public ResponseEntity<Activity> getActivityById(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Activity activity = activityService.getActivityById(id, userDetails.getUsername());
        return ResponseEntity.ok(activity);
    }

    // Create activity
    @PostMapping
    public ResponseEntity<Activity> saveActivity(
            @RequestBody Activity activity,
            @AuthenticationPrincipal UserDetails userDetails) {
        Activity saved = activityService.saveActivity(activity, userDetails.getUsername());
        return ResponseEntity.ok(saved);
    }

    // Update activity
    @PutMapping("/{id}")
    public ResponseEntity<Activity> updateActivity(
            @PathVariable Integer id,
            @RequestBody Activity activity,
            @AuthenticationPrincipal UserDetails userDetails) {
        Activity updated = activityService.updateActivity(id, activity, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    // Update activity status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Activity> updateActivityStatus(
            @PathVariable Integer id,
            @RequestParam("status") String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        Activity updated = activityService.updateActivityStatus(id, status, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    // Reorder activities
    @PutMapping("/reorder")
    public ResponseEntity<String> reorderActivities(
            @RequestBody List<Integer> activityIds,
            @AuthenticationPrincipal UserDetails userDetails) {
        activityService.reorderActivities(activityIds, userDetails.getUsername());
        return ResponseEntity.ok("Activities reordered successfully!");
    }

    // Delete activity
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteActivity(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        activityService.deleteActivity(id, userDetails.getUsername());
        return ResponseEntity.ok("Activity deleted successfully!");
    }
}