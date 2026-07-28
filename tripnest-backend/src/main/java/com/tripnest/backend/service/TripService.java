package com.tripnest.backend.service;

import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import com.tripnest.backend.entity.User;
import com.tripnest.backend.repository.UserRepository;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public TripService(TripRepository tripRepository,
                    UserRepository userRepository) {

        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    // Create a new trip
    public Trip createTrip(Trip trip, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        trip.setUser(user);

        return tripRepository.save(trip);
    }

    // Get all trips
    public List<Trip> getAllTrips(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return tripRepository.findByUser(user);

    }

    // Get trips by user
    public List<Trip> getTripsByUserId(Long userId) {
        return tripRepository.findByUserId(userId);
    }

    // Get Trip by ID
    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    // Update Trip
    public Trip updateTrip(Long id, Trip updatedTrip) {

        Trip trip = getTripById(id);

        trip.setTitle(updatedTrip.getTitle());
        trip.setDestination(updatedTrip.getDestination());
        trip.setStartDate(updatedTrip.getStartDate());
        trip.setEndDate(updatedTrip.getEndDate());
        trip.setBudget(updatedTrip.getBudget());
        trip.setStatus(updatedTrip.getStatus());
        trip.setDescription(updatedTrip.getDescription());

        return tripRepository.save(trip);
    }

    // Delete Trip
    public void deleteTrip(Long id) {

        Trip trip = getTripById(id);

        tripRepository.delete(trip);
    }

}