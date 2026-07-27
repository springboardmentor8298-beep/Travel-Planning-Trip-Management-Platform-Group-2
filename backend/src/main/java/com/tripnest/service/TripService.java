package com.tripnest.service;

import com.tripnest.dto.trip.TripRequest;
import com.tripnest.dto.trip.TripResponse;
import com.tripnest.entity.enums.TripStatus;

import java.util.List;

public interface TripService {

    TripResponse createTrip(Long ownerId, TripRequest request);

    List<TripResponse> getMyTrips(Long ownerId, TripStatus status);

    TripResponse getTrip(Long tripId, Long ownerId);

    TripResponse updateTrip(Long tripId, Long ownerId, TripRequest request);

    TripResponse updateStatus(Long tripId, Long ownerId, TripStatus status);

    void deleteTrip(Long tripId, Long ownerId);
}
