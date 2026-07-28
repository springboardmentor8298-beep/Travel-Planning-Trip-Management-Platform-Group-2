package com.tripnest.controller;

import com.tripnest.dto.ItineraryRequest;
import com.tripnest.dto.ItineraryResponse;
import com.tripnest.entity.User;
import com.tripnest.service.ItineraryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/itineraries")
@CrossOrigin(origins = "*")
public class ItineraryController {
    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @PostMapping
    public ResponseEntity<ItineraryResponse> createItinerary(@PathVariable Long tripId, @RequestBody ItineraryRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(itineraryService.createItinerary(tripId, request, user));
    }

    @GetMapping
    public ResponseEntity<List<ItineraryResponse>> getTripItineraries(@PathVariable Long tripId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(itineraryService.getTripItineraries(tripId, user));
    }

    @GetMapping("/{itineraryId}")
    public ResponseEntity<ItineraryResponse> getItineraryById(@PathVariable Long tripId, @PathVariable Long itineraryId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(itineraryService.getItineraryById(tripId, itineraryId, user));
    }

    @PutMapping("/{itineraryId}")
    public ResponseEntity<ItineraryResponse> updateItinerary(@PathVariable Long tripId, @PathVariable Long itineraryId, @RequestBody ItineraryRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(itineraryService.updateItinerary(tripId, itineraryId, request, user));
    }

    @DeleteMapping("/{itineraryId}")
    public ResponseEntity<Void> deleteItinerary(@PathVariable Long tripId, @PathVariable Long itineraryId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        itineraryService.deleteItinerary(tripId, itineraryId, user);
        return ResponseEntity.noContent().build();
    }
}
