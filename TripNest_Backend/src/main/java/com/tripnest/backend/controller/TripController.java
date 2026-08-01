package com.tripnest.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateTripRequest;
import com.tripnest.backend.dto.UpdateTripRequest;
import com.tripnest.backend.dto.response.TripResponse;
import com.tripnest.backend.service.TripService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    
    @PostMapping
    public ApiResponse<TripResponse> createTrip(
            @Valid @RequestBody CreateTripRequest request) {

        return tripService.createTrip(request);

    }
    @GetMapping
    public ApiResponse<List<TripResponse>> getMyTrips(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String search,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String status,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String sort) {

        return tripService.getMyTrips(search, status, sort);

    }
    
    @GetMapping("/{id}")
    public ApiResponse<com.tripnest.backend.dto.response.TripDetailsResponse> getTripById(
            @PathVariable Long id) {

        return tripService.getTripById(id);

    }
    
    @PutMapping("/{id}")
    public ApiResponse<TripResponse> updateTrip(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTripRequest request) {

        return tripService.updateTrip(id, request);
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteTrip(
            @PathVariable Long id) {

        return tripService.deleteTrip(id);

    }

}