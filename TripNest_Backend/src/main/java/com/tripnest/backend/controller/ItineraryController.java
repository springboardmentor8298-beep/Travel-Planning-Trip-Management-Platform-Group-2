package com.tripnest.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateItineraryRequest;
import com.tripnest.backend.dto.response.ItineraryResponse;
import com.tripnest.backend.service.ItineraryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping("/{tripId}/itinerary")
    public ApiResponse<ItineraryResponse> createItinerary(
            @PathVariable Long tripId,
            @Valid @RequestBody CreateItineraryRequest request) {

        return itineraryService.createItinerary(tripId, request);
    }

    @GetMapping("/{tripId}/itinerary")
    public ApiResponse<List<ItineraryResponse>> getTripItinerary(
            @PathVariable Long tripId) {

        return itineraryService.getTripItinerary(tripId);
    }
}