package com.tripnest.service;

import com.tripnest.dto.ItineraryRequest;
import com.tripnest.dto.ItineraryResponse;
import com.tripnest.entity.Destination;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItineraryService {
    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;

    public ItineraryService(ItineraryRepository itineraryRepository, TripRepository tripRepository, DestinationRepository destinationRepository) {
        this.itineraryRepository = itineraryRepository;
        this.tripRepository = tripRepository;
        this.destinationRepository = destinationRepository;
    }

    public ItineraryResponse createItinerary(Long tripId, ItineraryRequest request, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Itinerary itinerary = new Itinerary();
        itinerary.setDate(request.getDate());
        itinerary.setTitle(request.getTitle());
        itinerary.setNotes(request.getNotes());
        itinerary.setTrip(trip);
        if (request.getDestinationId() != null) {
            Destination destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found"));
            itinerary.setDestination(destination);
        }
        itinerary = itineraryRepository.save(itinerary);
        return toItineraryResponse(itinerary);
    }

    public List<ItineraryResponse> getTripItineraries(Long tripId, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        return itineraryRepository.findByTripOrderByDateAsc(trip).stream()
                .map(this::toItineraryResponse)
                .collect(Collectors.toList());
    }

    public ItineraryResponse getItineraryById(Long tripId, Long itineraryId, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Itinerary itinerary = itineraryRepository.findByIdAndTrip(itineraryId, trip)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        return toItineraryResponse(itinerary);
    }

    public ItineraryResponse updateItinerary(Long tripId, Long itineraryId, ItineraryRequest request, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Itinerary itinerary = itineraryRepository.findByIdAndTrip(itineraryId, trip)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        itinerary.setDate(request.getDate());
        itinerary.setTitle(request.getTitle());
        itinerary.setNotes(request.getNotes());
        if (request.getDestinationId() != null) {
            Destination destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found"));
            itinerary.setDestination(destination);
        } else {
            itinerary.setDestination(null);
        }
        itinerary = itineraryRepository.save(itinerary);
        return toItineraryResponse(itinerary);
    }

    public void deleteItinerary(Long tripId, Long itineraryId, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Itinerary itinerary = itineraryRepository.findByIdAndTrip(itineraryId, trip)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        itineraryRepository.delete(itinerary);
    }

    private ItineraryResponse toItineraryResponse(Itinerary itinerary) {
        ItineraryResponse response = new ItineraryResponse();
        response.setId(itinerary.getId());
        response.setDate(itinerary.getDate());
        response.setTitle(itinerary.getTitle());
        response.setNotes(itinerary.getNotes());
        if (itinerary.getDestination() != null) {
            response.setDestinationId(itinerary.getDestination().getId());
            response.setDestinationName(itinerary.getDestination().getName());
        }
        response.setCreatedAt(itinerary.getCreatedAt());
        response.setUpdatedAt(itinerary.getUpdatedAt());
        return response;
    }
}
