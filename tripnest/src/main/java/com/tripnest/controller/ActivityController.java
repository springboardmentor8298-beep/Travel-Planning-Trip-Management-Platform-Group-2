package com.tripnest.controller;

import com.tripnest.dto.ActivityRequest;
import com.tripnest.dto.ActivityResponse;
import com.tripnest.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for activity management within an itinerary day.
 * <p>
 * Routes:
 *   POST   /api/itineraries/{itineraryId}/activities        — add activity
 *   GET    /api/itineraries/{itineraryId}/activities        — list activities
 *   PUT    /api/itineraries/{itineraryId}/activities/{id}   — update activity
 *   DELETE /api/itineraries/{itineraryId}/activities/{id}   — delete activity
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/itineraries/{itineraryId}/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    public ResponseEntity<ActivityResponse> addActivity(
            @PathVariable Long itineraryId,
            @Valid @RequestBody ActivityRequest request) {
        ActivityResponse res = activityService.addActivity(itineraryId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getActivities(
            @PathVariable Long itineraryId) {
        return ResponseEntity.ok(activityService.getActivities(itineraryId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityResponse> updateActivity(
            @PathVariable Long itineraryId,
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest request) {
        return ResponseEntity.ok(activityService.updateActivity(id, itineraryId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable Long itineraryId,
            @PathVariable Long id) {
        activityService.deleteActivity(id, itineraryId);
        return ResponseEntity.noContent().build();
    }
}
