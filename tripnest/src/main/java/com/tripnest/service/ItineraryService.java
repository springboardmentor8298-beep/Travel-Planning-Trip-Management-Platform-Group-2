package com.tripnest.service;

import com.tripnest.dto.ActivityResponse;
import com.tripnest.dto.ItineraryRequest;
import com.tripnest.dto.ItineraryResponse;
import com.tripnest.entity.Activity;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ActivityRepository activityRepository;

    // ==========================
    // Create Itinerary
    // ==========================
    public ItineraryResponse createItinerary(ItineraryRequest request, Long userId) {

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Prevent duplicate itinerary for same date
        if (itineraryRepository.existsByTripIdAndDate(
                request.getTripId(),
                request.getDate())) {

            throw new RuntimeException(
                    "Itinerary already exists for this date");
        }

        Itinerary itinerary = new Itinerary();
        itinerary.setTrip(trip);
        itinerary.setDate(request.getDate());
        itinerary.setNotes(request.getNotes());

        Itinerary saved = itineraryRepository.save(itinerary);

        return mapToResponse(saved);
    }

    // ==========================
    // Get Trip Itineraries
    // ==========================
    public List<ItineraryResponse> getTripItineraries(Long tripId,
                                                      Long userId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        return itineraryRepository
                .findByTripIdOrderByDateAsc(tripId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ==========================
    // Get One Itinerary
    // ==========================
    public ItineraryResponse getItinerary(Long id,
                                          Long userId) {

        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getTrip().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        return mapToResponse(itinerary);
    }

    // ==========================
    // Update
    // ==========================
    public ItineraryResponse updateItinerary(Long id,
                                             ItineraryRequest request,
                                             Long userId) {

        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getTrip().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        itinerary.setDate(request.getDate());
        itinerary.setNotes(request.getNotes());

        Itinerary updated = itineraryRepository.save(itinerary);

        return mapToResponse(updated);
    }

    // ==========================
    // Delete
    // ==========================
    public void deleteItinerary(Long id,
                                Long userId) {

        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getTrip().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        itineraryRepository.delete(itinerary);
    }

    // ==========================
    // Mapping
    // ==========================
    private ItineraryResponse mapToResponse(Itinerary itinerary) {

        ItineraryResponse response = new ItineraryResponse();

        response.setId(itinerary.getId());
        response.setTripId(itinerary.getTrip().getId());
        response.setTripTitle(itinerary.getTrip().getTitle());

        response.setDate(itinerary.getDate());
        response.setNotes(itinerary.getNotes());

        response.setCreatedAt(itinerary.getCreatedAt());
        response.setUpdatedAt(itinerary.getUpdatedAt());

        List<ActivityResponse> activities =
                activityRepository
                        .findByItineraryIdOrderByStartTimeAsc(itinerary.getId())
                        .stream()
                        .map(this::mapActivity)
                        .collect(Collectors.toList());

        response.setActivities(activities);

        return response;
    }

    private ActivityResponse mapActivity(Activity activity) {

        ActivityResponse response = new ActivityResponse();

        response.setId(activity.getId());
        response.setTitle(activity.getTitle());
        response.setDescription(activity.getDescription());

        response.setStartTime(activity.getStartTime());
        response.setEndTime(activity.getEndTime());

        response.setLocation(activity.getLocation());

        response.setType(
                activity.getType() != null
                        ? activity.getType().name()
                        : null);

        response.setCost(activity.getCost());

        response.setItineraryId(activity.getItinerary().getId());

        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());

        return response;
    }
}