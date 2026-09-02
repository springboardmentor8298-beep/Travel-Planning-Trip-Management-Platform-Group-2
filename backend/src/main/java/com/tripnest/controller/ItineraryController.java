package com.tripnest.controller;

import com.tripnest.entity.Itinerary;
import com.tripnest.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    // Get all itineraries for a specific trip
    @GetMapping
    public ResponseEntity<List<Itinerary>> getItinerariesByTrip(
            @RequestParam("tripId") Integer tripId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Itinerary> itineraries = itineraryService.getItinerariesByTripId(tripId, userDetails.getUsername());
        return ResponseEntity.ok(itineraries);
    }

    // Get itinerary by ID
    @GetMapping("/{id}")
    public ResponseEntity<Itinerary> getItineraryById(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Itinerary itinerary = itineraryService.getItineraryById(id, userDetails.getUsername());
        return ResponseEntity.ok(itinerary);
    }

    // Create itinerary
    @PostMapping
    public ResponseEntity<Itinerary> saveItinerary(
            @RequestBody Itinerary itinerary,
            @AuthenticationPrincipal UserDetails userDetails) {
        Itinerary saved = itineraryService.saveItinerary(itinerary, userDetails.getUsername());
        return ResponseEntity.ok(saved);
    }

    // Update itinerary
    @PutMapping("/{id}")
    public ResponseEntity<Itinerary> updateItinerary(
            @PathVariable Integer id,
            @RequestBody Itinerary itinerary,
            @AuthenticationPrincipal UserDetails userDetails) {
        Itinerary updated = itineraryService.updateItinerary(id, itinerary, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    // Delete itinerary
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteItinerary(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        itineraryService.deleteItinerary(id, userDetails.getUsername());
        return ResponseEntity.ok("Itinerary deleted successfully!");
    }
}