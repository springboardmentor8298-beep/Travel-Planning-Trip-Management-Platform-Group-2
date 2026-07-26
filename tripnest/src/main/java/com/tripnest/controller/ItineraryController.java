package com.tripnest.controller;

import com.tripnest.dto.ItineraryRequest;
import com.tripnest.dto.ItineraryResponse;
import com.tripnest.security.services.UserDetailsImpl;
import com.tripnest.service.ItineraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for itinerary (day-plan) management within a trip.
 * <p>
 * Routes:
 *   POST   /api/trips/{tripId}/itineraries        — add day
 *   GET    /api/trips/{tripId}/itineraries        — list days
 *   PUT    /api/trips/{tripId}/itineraries/{id}   — update day
 *   DELETE /api/trips/{tripId}/itineraries/{id}   — delete day
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trips/{tripId}/itineraries")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping
    public ResponseEntity<ItineraryResponse> addItinerary(
            @PathVariable Long tripId,
            @Valid @RequestBody ItineraryRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        ItineraryResponse res = itineraryService.addItinerary(tripId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    public ResponseEntity<List<ItineraryResponse>> getItineraries(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(itineraryService.getTripItineraries(tripId, currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItineraryResponse> updateItinerary(
            @PathVariable Long tripId,
            @PathVariable Long id,
            @Valid @RequestBody ItineraryRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(itineraryService.updateItinerary(id, tripId, currentUser.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItinerary(
            @PathVariable Long tripId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        itineraryService.deleteItinerary(id, tripId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
