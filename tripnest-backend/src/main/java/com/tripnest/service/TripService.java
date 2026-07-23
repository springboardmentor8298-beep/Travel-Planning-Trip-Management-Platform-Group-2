package com.tripnest.service;

import com.tripnest.model.Trip;
import com.tripnest.model.User;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    // Save Trip
    public Trip saveTrip(Trip trip, String email) {

        User user = userRepository.findByEmail(email);

        trip.setUser(user);

        return tripRepository.save(trip);
    }

    // Get Trips of Logged-in User
    public List<Trip> getTripsByUser(String email) {

        User user = userRepository.findByEmail(email);

        return tripRepository.findByUser(user);
    }

    // Get Trip By ID
    public Trip getTripById(int id) {
        return tripRepository.findById(id).orElse(null);
    }

    // Update Trip
    public Trip updateTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    // Delete Trip
    public void deleteTrip(int id) {
        tripRepository.deleteById(id);
    }
}