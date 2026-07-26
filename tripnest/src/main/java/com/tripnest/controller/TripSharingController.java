package com.tripnest.controller;

import com.tripnest.service.TripSharingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TripSharingController {

    private final TripSharingService tripSharingService;

    @PostMapping("/{tripId}/share")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<String> generateShareLink(@PathVariable Long tripId) {
        String shareToken = tripSharingService.generateShareToken(tripId);
        return ResponseEntity.ok(shareToken);
    }

    @PutMapping("/{tripId}/public")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> makeTripPublic(@PathVariable Long tripId) {
        tripSharingService.makeTripPublic(tripId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{tripId}/private")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> makeTripPrivate(@PathVariable Long tripId) {
        tripSharingService.makeTripPrivate(tripId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/shared/{shareToken}")
    public ResponseEntity<?> getSharedTrip(@PathVariable String shareToken) {
        try {
            var trip = tripSharingService.getTripByShareToken(shareToken);
            return ResponseEntity.ok(trip);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
