package com.tripnest.backend.service;

import java.util.List;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateItineraryRequest;
import com.tripnest.backend.dto.response.ItineraryResponse;

public interface ItineraryService {

    ApiResponse<ItineraryResponse> createItinerary(
            Long tripId,
            CreateItineraryRequest request);

    ApiResponse<List<ItineraryResponse>> getTripItinerary(Long tripId);

}