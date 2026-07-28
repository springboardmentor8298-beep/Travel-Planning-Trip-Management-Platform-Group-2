package com.tripnest.backend.controller;

import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.service.TripService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.security.Principal;

@RestController
@RequestMapping("/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    // Create Trip
    @PostMapping
    public Trip createTrip(@RequestBody Trip trip,
                        Principal principal) {

        return tripService.createTrip(
                trip,
                principal.getName()
        );
    }

    // Get All Trips
    @GetMapping
    public List<Trip> getAllTrips(Principal principal) {

        System.out.println("====== GET /trips Controller Called ======");

        List<Trip> trips = tripService.getAllTrips(
                principal.getName()
        );

        System.out.println("Trips found: " + trips.size());

        return trips;
    }

    // Get Trips by User
    @GetMapping("/user/{userId}")
    public List<Trip> getTripsByUserId(@PathVariable Long userId) {
        return tripService.getTripsByUserId(userId);
    }

    // Get Trip by ID
    @GetMapping("/{id}")
    public Trip getTripById(@PathVariable Long id) {
        return tripService.getTripById(id);
    }

    // Update Trip
    @PutMapping("/{id}")
    public Trip updateTrip(@PathVariable Long id,
            @RequestBody Trip trip) {

        return tripService.updateTrip(id, trip);
    }

    // Delete Trip
    @DeleteMapping("/{id}")
    public void deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
    }

}