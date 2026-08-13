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

    @Autowired
    private NotificationService notificationService;

    // Save Trip
    public Trip saveTrip(Trip trip, String email) {

        User user = userRepository.findByEmail(email);

        trip.setUser(user);

        Trip savedTrip = tripRepository.save(trip);

        String msg = "🎉 New Trip Scheduled: Expedition to " + savedTrip.getDestination() + 
                " from " + savedTrip.getStartDate() + " to " + savedTrip.getEndDate();
        notificationService.createNotification(msg);

        return savedTrip;
    }

    // Get Trips of Logged-in User (both owned and collaborated)
    public List<Trip> getTripsByUser(String email) {
        User user = userRepository.findByEmail(email);

        List<Trip> ownedTrips = tripRepository.findByUser(user);
        List<Trip> collaboratedTrips = tripRepository.findByCollaboratorEmailsContaining(email);

        // Combine lists without duplicates
        for (Trip trip : collaboratedTrips) {
            if (!ownedTrips.contains(trip)) {
                ownedTrips.add(trip);
            }
        }

        return ownedTrips;
    }

    // Add Collaborator to Trip
    public Trip addCollaborator(int tripId, String collaboratorEmail) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));

        if (!trip.getCollaboratorEmails().contains(collaboratorEmail)) {
            trip.getCollaboratorEmails().add(collaboratorEmail);
            tripRepository.save(trip);

            String ownerEmail = (trip.getUser() != null) ? trip.getUser().getEmail() : "Owner";
            String msg = "👥 You were added as a co-traveler to trip: " + trip.getDestination() + " by " + ownerEmail;
            notificationService.createNotification(msg);
        }

        return trip;
    }

    // Remove Collaborator from Trip
    public Trip removeCollaborator(int tripId, String collaboratorEmail) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));

        if (trip.getCollaboratorEmails().contains(collaboratorEmail)) {
            trip.getCollaboratorEmails().remove(collaboratorEmail);
            tripRepository.save(trip);
        }

        return trip;
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