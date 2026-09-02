package com.tripnest.service;

import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import java.util.List;

public interface TripService {
    TripResponse createTrip(TripRequest request, String email);
    List<TripResponse> getAllUserTrips(String email);
    List<TripResponse> getAllUserTrips(String email, String search, String status, String sortBy);
    List<TripResponse> getAllTrips();
    TripResponse getTripById(Integer tripId, String email);
    TripResponse updateTrip(Integer tripId, TripRequest request, String email);
    void deleteTrip(Integer tripId, String email);
    TripResponse duplicateTrip(Integer tripId, String email);
    TripResponse archiveTrip(Integer tripId, String email);
}