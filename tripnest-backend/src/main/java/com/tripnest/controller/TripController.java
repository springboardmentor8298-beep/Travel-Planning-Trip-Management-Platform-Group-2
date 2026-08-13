package com.tripnest.controller;

import com.tripnest.model.Trip;
import com.tripnest.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trips")
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    @Autowired
    private TripService tripService;

    // Save Trip for Logged-in User
    @PostMapping("/add")
    public Trip addTrip(@RequestBody Trip trip, Authentication authentication) {

        String email = authentication.getName();

        return tripService.saveTrip(trip, email);
    }

    // Get Trips of Logged-in User
    @GetMapping("/all")
    public List<Trip> getAllTrips(Authentication authentication) {

        String email = authentication.getName();

        return tripService.getTripsByUser(email);
    }

    // Get Trip By ID
    @GetMapping("/{id}")
    public Trip getTripById(@PathVariable int id) {
        return tripService.getTripById(id);
    }

    // Update Trip
    @PutMapping("/update")
    public Trip updateTrip(@RequestBody Trip trip) {
        return tripService.updateTrip(trip);
    }

    // Delete Trip
    @DeleteMapping("/delete/{id}")
    public String deleteTrip(@PathVariable int id) {

        tripService.deleteTrip(id);

        return "Trip Deleted Successfully";
    }

    // Invite Collaborator
    @PostMapping("/{id}/collaborators/invite")
    public Trip inviteCollaborator(@PathVariable int id, @RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        return tripService.addCollaborator(id, email.trim());
    }

    // Remove Collaborator
    @DeleteMapping("/{id}/collaborators/remove")
    public Trip removeCollaborator(@PathVariable int id, @RequestParam String email) {
        return tripService.removeCollaborator(id, email.trim());
    }
}