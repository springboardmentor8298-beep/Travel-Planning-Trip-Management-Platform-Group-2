package com.tripnest.controller;

import com.tripnest.dto.ItineraryRequest;
import com.tripnest.dto.ItineraryResponse;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.ItineraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping("/api/trips/{tripId}/itineraries")
    public ResponseEntity<ItineraryResponse> createItinerary(@PathVariable Long tripId,
                                                               @Valid @RequestBody ItineraryRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(itineraryService.createItinerary(email, tripId, request));
    }

    @GetMapping("/api/trips/{tripId}/itineraries")
    public ResponseEntity<List<ItineraryResponse>> getItinerariesForTrip(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(itineraryService.getItinerariesForTrip(email, tripId));
    }

    @PutMapping("/api/itineraries/{itineraryId}")
    public ResponseEntity<ItineraryResponse> updateItinerary(@PathVariable Long itineraryId,
                                                              @Valid @RequestBody ItineraryRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(itineraryService.updateItinerary(email, itineraryId, request));
    }

    @DeleteMapping("/api/itineraries/{itineraryId}")
    public ResponseEntity<Void> deleteItinerary(@PathVariable Long itineraryId) {
        String email = SecurityUtils.getCurrentUserEmail();
        itineraryService.deleteItinerary(email, itineraryId);
        return ResponseEntity.noContent().build();
    }
}
