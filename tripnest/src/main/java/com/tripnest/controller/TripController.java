package com.tripnest.controller;

import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import com.tripnest.dto.TripStatsResponse;
import com.tripnest.security.services.UserDetailsImpl;
import com.tripnest.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for trip management.
 * <p>
 * All endpoints require authentication. Trip ownership is enforced in the service layer.
 * <p>
 * Routes:
 *   POST   /api/trips        — create trip
 *   GET    /api/trips        — list my trips
 *   GET    /api/trips/stats  — dashboard stats
 *   GET    /api/trips/{id}   — trip detail
 *   PUT    /api/trips/{id}   — update trip
 *   DELETE /api/trips/{id}   — delete trip
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(
            @Valid @RequestBody TripRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        TripResponse trip = tripService.createTrip(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(trip);
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getMyTrips(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(tripService.getUserTrips(currentUser.getId()));
    }

    @GetMapping("/stats")
    public ResponseEntity<TripStatsResponse> getStats(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(tripService.getStats(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(tripService.getTripById(id, currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(
            @PathVariable Long id,
            @Valid @RequestBody TripRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(tripService.updateTrip(id, currentUser.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        tripService.deleteTrip(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
