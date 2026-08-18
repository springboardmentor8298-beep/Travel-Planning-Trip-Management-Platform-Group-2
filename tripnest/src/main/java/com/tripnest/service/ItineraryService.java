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
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;

    public ItineraryService(ItineraryRepository itineraryRepository,
                            TripRepository tripRepository,
                            ActivityRepository activityRepository) {

        this.itineraryRepository = itineraryRepository;
        this.tripRepository = tripRepository;
        this.activityRepository = activityRepository;
    }

    // ==========================
    // Create Itinerary
    // ==========================
    public ItineraryResponse createItinerary(ItineraryRequest request,
                                             Long userId) {

        Trip trip = getAuthorizedTrip(request.getTripId(), userId);

        if (itineraryRepository.existsByTripIdAndDate(
                request.getTripId(),
                request.getDate())) {

            throw new RuntimeException(
                    "An itinerary already exists for this date.");
        }

        Itinerary itinerary = new Itinerary();
        itinerary.setTrip(trip);
        itinerary.setDate(request.getDate());
        itinerary.setNotes(request.getNotes());

        return mapToResponse(
                itineraryRepository.save(itinerary)
        );
    }

    // ==========================
    // Get All Itineraries
    // ==========================
    public List<ItineraryResponse> getTripItineraries(Long tripId,
                                                      Long userId) {

        getAuthorizedTrip(tripId, userId);

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

        Itinerary itinerary = getAuthorizedItinerary(id, userId);

        return mapToResponse(itinerary);
    }

    // ==========================
    // Update Itinerary
    // ==========================
    public ItineraryResponse updateItinerary(Long id,
                                             ItineraryRequest request,
                                             Long userId) {

        Itinerary itinerary = getAuthorizedItinerary(id, userId);

        boolean duplicate =
                itineraryRepository.existsByTripIdAndDateAndIdNot(
                        itinerary.getTrip().getId(),
                        request.getDate(),
                        itinerary.getId());

        if (duplicate) {
            throw new RuntimeException(
                    "Another itinerary already exists for this date.");
        }

        itinerary.setDate(request.getDate());
        itinerary.setNotes(request.getNotes());

        return mapToResponse(
                itineraryRepository.save(itinerary)
        );
    }

    // ==========================
    // Delete Itinerary
    // ==========================
    public void deleteItinerary(Long id,
                                Long userId) {

        Itinerary itinerary = getAuthorizedItinerary(id, userId);

        itineraryRepository.delete(itinerary);
    }

    // ==========================
    // Helper Methods
    // ==========================

    private Trip getAuthorizedTrip(Long tripId,
                                   Long userId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        if (!trip.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "You are not authorized to access this trip.");
        }

        return trip;
    }

    private Itinerary getAuthorizedItinerary(Long itineraryId,
                                             Long userId) {

        Itinerary itinerary =
                itineraryRepository.findById(itineraryId)
                        .orElseThrow(() ->
                                new RuntimeException("Itinerary not found"));

        if (!itinerary.getTrip().getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "You are not authorized to access this itinerary.");
        }

        return itinerary;
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
                        : null
        );

        response.setCost(activity.getCost());

        response.setItineraryId(activity.getItinerary().getId());

        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());

        return response;
    }
}