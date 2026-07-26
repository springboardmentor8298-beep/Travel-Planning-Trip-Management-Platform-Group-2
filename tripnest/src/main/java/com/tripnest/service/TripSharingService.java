package com.tripnest.service;

import com.tripnest.entity.Trip;
import com.tripnest.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TripSharingService {

    private final TripRepository tripRepository;

    public String generateShareToken(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (trip.getShareToken() == null) {
            String token = UUID.randomUUID().toString();
            trip.setShareToken(token);
            tripRepository.save(trip);
        }

        return trip.getShareToken();
    }

    public void makeTripPublic(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        trip.setPublic(true);
        if (trip.getShareToken() == null) {
            trip.setShareToken(UUID.randomUUID().toString());
        }
        tripRepository.save(trip);
    }

    public void makeTripPrivate(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        trip.setPublic(false);
        tripRepository.save(trip);
    }

    public Trip getTripByShareToken(String shareToken) {
        return tripRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }
}
