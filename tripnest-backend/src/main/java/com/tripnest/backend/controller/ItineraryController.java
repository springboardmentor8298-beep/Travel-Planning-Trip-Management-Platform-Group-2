package com.tripnest.backend.controller;

import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.service.ItineraryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/itineraries")
public class ItineraryController {

    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    // Create Itinerary
    @PostMapping
    public Itinerary createItinerary(@RequestBody Itinerary itinerary) {
        return itineraryService.createItinerary(itinerary);
    }

    // Get Itineraries by Trip
    @GetMapping("/trip/{tripId}")
    public List<Itinerary> getItinerariesByTrip(@PathVariable Long tripId) {
        return itineraryService.getItinerariesByTrip(tripId);
    }
}