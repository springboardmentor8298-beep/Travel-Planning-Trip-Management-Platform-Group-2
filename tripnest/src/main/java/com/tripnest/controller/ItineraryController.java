package com.tripnest.controller;

import com.tripnest.dto.ItineraryRequest;
import com.tripnest.dto.ItineraryResponse;
import com.tripnest.dto.MessageResponse;
import com.tripnest.security.UserDetailsImpl;
import com.tripnest.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    // ==========================
    // Create Itinerary
    // ==========================
    @PostMapping
    public ResponseEntity<ItineraryResponse> createItinerary(
            @RequestBody ItineraryRequest request) {

        UserDetailsImpl userDetails = getCurrentUser();

        ItineraryResponse response =
                itineraryService.createItinerary(request, userDetails.getId());

        return ResponseEntity.ok(response);
    }

    // ==========================
    // Get All Itineraries of Trip
    // ==========================
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<ItineraryResponse>> getTripItineraries(
            @PathVariable Long tripId) {

        UserDetailsImpl userDetails = getCurrentUser();

        List<ItineraryResponse> itineraries =
                itineraryService.getTripItineraries(
                        tripId,
                        userDetails.getId());

        return ResponseEntity.ok(itineraries);
    }

    // ==========================
    // Get One Itinerary
    // ==========================
    @GetMapping("/{id}")
    public ResponseEntity<ItineraryResponse> getItinerary(
            @PathVariable Long id) {

        UserDetailsImpl userDetails = getCurrentUser();

        ItineraryResponse response =
                itineraryService.getItinerary(id, userDetails.getId());

        return ResponseEntity.ok(response);
    }

    // ==========================
    // Update Itinerary
    // ==========================
    @PutMapping("/{id}")
    public ResponseEntity<ItineraryResponse> updateItinerary(
            @PathVariable Long id,
            @RequestBody ItineraryRequest request) {

        UserDetailsImpl userDetails = getCurrentUser();

        ItineraryResponse response =
                itineraryService.updateItinerary(
                        id,
                        request,
                        userDetails.getId());

        return ResponseEntity.ok(response);
    }

    // ==========================
    // Delete Itinerary
    // ==========================
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteItinerary(
            @PathVariable Long id) {

        UserDetailsImpl userDetails = getCurrentUser();

        itineraryService.deleteItinerary(id, userDetails.getId());

        return ResponseEntity.ok(
                new MessageResponse("Itinerary deleted successfully!")
        );
    }

    // ==========================
    // Current Logged-in User
    // ==========================
    private UserDetailsImpl getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (UserDetailsImpl) authentication.getPrincipal();
    }
}