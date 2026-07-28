package com.tripnest.backend.service;

import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.repository.ItineraryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;

    public ItineraryService(ItineraryRepository itineraryRepository) {
        this.itineraryRepository = itineraryRepository;
    }

    // Create Itinerary
    public Itinerary createItinerary(Itinerary itinerary) {
        return itineraryRepository.save(itinerary);
    }

    // Get Itineraries by Trip
    public List<Itinerary> getItinerariesByTrip(Long tripId) {
        return itineraryRepository.findByTripId(tripId);
    }
}