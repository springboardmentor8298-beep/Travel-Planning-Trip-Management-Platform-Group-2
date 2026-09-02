package com.tripnest.controller;

import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import com.tripnest.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request,
                                                   @AuthenticationPrincipal UserDetails userDetails) {
        TripResponse response = tripService.createTrip(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getAllUserTrips(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TripResponse> response = tripService.getAllUserTrips(userDetails.getUsername(), search, status, sortBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<TripResponse>> getAllTrips() {
        List<TripResponse> response = tripService.getAllTrips();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable("id") Integer tripId,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        TripResponse response = tripService.getTripById(tripId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable("id") Integer tripId,
                                                   @Valid @RequestBody TripRequest request,
                                                   @AuthenticationPrincipal UserDetails userDetails) {
        TripResponse response = tripService.updateTrip(tripId, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable("id") Integer tripId,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        tripService.deleteTrip(tripId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<TripResponse> duplicateTrip(@PathVariable("id") Integer tripId,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        TripResponse response = tripService.duplicateTrip(tripId, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<TripResponse> archiveTrip(@PathVariable("id") Integer tripId,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        TripResponse response = tripService.archiveTrip(tripId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}