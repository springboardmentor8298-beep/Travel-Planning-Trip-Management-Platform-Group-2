package com.tripnest.controller;

import com.tripnest.dto.*;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.createTrip(email, request));
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getMyTrips() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.getMyTrips(email));
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<TripResponse> getTrip(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.getTrip(email, tripId));
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable Long tripId,
                                                    @Valid @RequestBody TripRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.updateTrip(email, tripId, request));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        tripService.deleteTrip(email, tripId);
        return ResponseEntity.noContent().build();
    }

    // Trip sharing - owner adds another registered user as a traveler
    @PostMapping("/{tripId}/travelers")
    public ResponseEntity<TripResponse> addTraveler(@PathVariable Long tripId,
                                                     @Valid @RequestBody AddTravelerRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.addTraveler(email, tripId, request));
    }

    // Trip dashboard - summary stats for one trip
    @GetMapping("/{tripId}/dashboard")
    public ResponseEntity<TripDashboardResponse> getDashboard(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.getDashboard(email, tripId));
    }
}
