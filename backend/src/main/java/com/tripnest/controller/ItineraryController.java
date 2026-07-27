package com.tripnest.controller;

import com.tripnest.dto.itinerary.ItineraryDayRequest;
import com.tripnest.dto.itinerary.ItineraryDayResponse;
import com.tripnest.dto.response.ApiResponse;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.ItineraryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trips/{tripId}/itinerary")
@RequiredArgsConstructor
@Tag(name = "Itineraries", description = "Day-wise itinerary planning for a trip")
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping("/generate")
    @Operation(summary = "Auto-generate one itinerary day per day of the trip")
    public ResponseEntity<ApiResponse<List<ItineraryDayResponse>>> generate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId) {
        List<ItineraryDayResponse> days = itineraryService.generateForTrip(tripId, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(days, "Itinerary generated"));
    }

    @GetMapping
    @Operation(summary = "List itinerary days for a trip, each with its scheduled activities")
    public ApiResponse<List<ItineraryDayResponse>> getDays(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId) {
        return ApiResponse.success(itineraryService.getDaysForTrip(tripId, principal.getId()));
    }

    @PostMapping
    @Operation(summary = "Add a single itinerary day to a trip")
    public ResponseEntity<ApiResponse<ItineraryDayResponse>> addDay(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @Valid @RequestBody ItineraryDayRequest request) {
        ItineraryDayResponse response = itineraryService.addDay(tripId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Itinerary day added"));
    }

    @PutMapping("/{dayId}")
    @Operation(summary = "Update an itinerary day")
    public ApiResponse<ItineraryDayResponse> updateDay(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @PathVariable Long dayId,
            @Valid @RequestBody ItineraryDayRequest request) {
        return ApiResponse.success(
                itineraryService.updateDay(tripId, dayId, principal.getId(), request), "Itinerary day updated");
    }

    @DeleteMapping("/{dayId}")
    @Operation(summary = "Delete an itinerary day")
    public ApiResponse<Void> deleteDay(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @PathVariable Long dayId) {
        itineraryService.deleteDay(tripId, dayId, principal.getId());
        return ApiResponse.success(null, "Itinerary day deleted");
    }
}
