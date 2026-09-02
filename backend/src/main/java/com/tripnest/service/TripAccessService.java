package com.tripnest.service;

import com.tripnest.exception.AccessDeniedCustomException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.Trip;
import com.tripnest.repository.TripRepository;
import org.springframework.stereotype.Service;

@Service
public class TripAccessService {

    private final TripRepository tripRepository;

    public TripAccessService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    public Trip findAccessibleTrip(String email, Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        boolean isOwner = trip.getOwner().getEmail().equalsIgnoreCase(email);
        boolean isTraveler = trip.getTravelers().stream()
                .anyMatch(traveler -> traveler.getEmail().equalsIgnoreCase(email));

        if (!isOwner && !isTraveler) {
            throw new AccessDeniedCustomException("You do not have access to this trip");
        }

        return trip;
    }

    public Trip findOwnedTrip(String email, Long tripId) {
        Trip trip = findAccessibleTrip(email, tripId);
        if (!trip.getOwner().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedCustomException("Only the trip owner can perform this action");
        }
        return trip;
    }
}
