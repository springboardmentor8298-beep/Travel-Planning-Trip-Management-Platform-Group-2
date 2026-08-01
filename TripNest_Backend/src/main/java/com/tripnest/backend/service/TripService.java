package com.tripnest.backend.service;

import java.util.List;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateTripRequest;
import com.tripnest.backend.dto.UpdateTripRequest;
import com.tripnest.backend.dto.response.TripResponse;

public interface TripService {

    ApiResponse<TripResponse> createTrip(CreateTripRequest request);

    ApiResponse<List<TripResponse>> getMyTrips(String search, String status, String sort);

    ApiResponse<com.tripnest.backend.dto.response.TripDetailsResponse> getTripById(Long id);

    ApiResponse<TripResponse> updateTrip(Long id, UpdateTripRequest request);

    ApiResponse<String> deleteTrip(Long id);

}