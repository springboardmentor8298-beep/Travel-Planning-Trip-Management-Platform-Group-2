package com.tripnest.service;

import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {
    private final TripRepository tripRepository;

    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    public TripResponse createTrip(TripRequest request, User user) {
        Trip trip = new Trip();
        trip.setName(request.getName());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setPhotoUrl(request.getPhotoUrl());
        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }
        trip.setUser(user);
        trip = tripRepository.save(trip);
        return toTripResponse(trip);
    }

    public List<TripResponse> getUserTrips(User user) {
        return tripRepository.findByUser(user).stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
    }

    public TripResponse getTripById(Long id, User user) {
        Trip trip = tripRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        return toTripResponse(trip);
    }

    public TripResponse updateTrip(Long id, TripRequest request, User user) {
        Trip trip = tripRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        trip.setName(request.getName());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setPhotoUrl(request.getPhotoUrl());
        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }
        trip = tripRepository.save(trip);
        return toTripResponse(trip);
    }

    public void deleteTrip(Long id, User user) {
        Trip trip = tripRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        tripRepository.delete(trip);
    }

    private TripResponse toTripResponse(Trip trip) {
        TripResponse response = new TripResponse();
        response.setId(trip.getId());
        response.setName(trip.getName());
        response.setDescription(trip.getDescription());
        response.setStartDate(trip.getStartDate());
        response.setEndDate(trip.getEndDate());
        response.setPhotoUrl(trip.getPhotoUrl());
        response.setStatus(trip.getStatus());
        response.setCreatedAt(trip.getCreatedAt());
        response.setUpdatedAt(trip.getUpdatedAt());
        return response;
    }
}
