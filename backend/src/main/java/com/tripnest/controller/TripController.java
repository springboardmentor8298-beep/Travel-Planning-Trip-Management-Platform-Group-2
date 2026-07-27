package com.tripnest.controller;

import com.tripnest.dto.response.ApiResponse;
import com.tripnest.dto.trip.TripRequest;
import com.tripnest.dto.trip.TripResponse;
import com.tripnest.dto.trip.TripStatusUpdateRequest;
import com.tripnest.entity.enums.TripStatus;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Trips", description = "Trip management for the authenticated traveler")
public class TripController {

    private final TripService tripService;

    @PostMapping
    @Operation(summary = "Create a new trip")
    public ResponseEntity<ApiResponse<TripResponse>> createTrip(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TripRequest request) {
        TripResponse response = tripService.createTrip(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Trip created successfully"));
    }

    @GetMapping
    @Operation(summary = "List the authenticated user's trips, optionally filtered by status")
    public ApiResponse<List<TripResponse>> getMyTrips(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) TripStatus status) {
        return ApiResponse.success(tripService.getMyTrips(principal.getId(), status));
    }

    @GetMapping("/{tripId}")
    @Operation(summary = "Get a single trip by id")
    public ApiResponse<TripResponse> getTrip(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId) {
        return ApiResponse.success(tripService.getTrip(tripId, principal.getId()));
    }

    @PutMapping("/{tripId}")
    @Operation(summary = "Update a trip")
    public ApiResponse<TripResponse> updateTrip(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @Valid @RequestBody TripRequest request) {
        return ApiResponse.success(tripService.updateTrip(tripId, principal.getId(), request), "Trip updated");
    }

    @PatchMapping("/{tripId}/status")
    @Operation(summary = "Update a trip's status")
    public ApiResponse<TripResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @Valid @RequestBody TripStatusUpdateRequest request) {
        return ApiResponse.success(
                tripService.updateStatus(tripId, principal.getId(), request.getStatus()), "Trip status updated");
    }

    @DeleteMapping("/{tripId}")
    @Operation(summary = "Delete a trip")
    public ApiResponse<Void> deleteTrip(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId) {
        tripService.deleteTrip(tripId, principal.getId());
        return ApiResponse.success(null, "Trip deleted");
    }
}
