package com.tripnest.service;

import com.tripnest.dto.itinerary.ItineraryDayRequest;
import com.tripnest.dto.itinerary.ItineraryDayResponse;

import java.util.List;

public interface ItineraryService {

    /** Auto-generates one itinerary day per calendar day in the trip's date range. */
    List<ItineraryDayResponse> generateForTrip(Long tripId, Long ownerId);

    List<ItineraryDayResponse> getDaysForTrip(Long tripId, Long ownerId);

    ItineraryDayResponse addDay(Long tripId, Long ownerId, ItineraryDayRequest request);

    ItineraryDayResponse updateDay(Long tripId, Long dayId, Long ownerId, ItineraryDayRequest request);

    void deleteDay(Long tripId, Long dayId, Long ownerId);
}
