package com.tripnest.service;

import com.tripnest.dto.ActivityResponse;
import com.tripnest.dto.ItineraryRequest;
import com.tripnest.dto.ItineraryResponse;
import com.tripnest.entity.Activity;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import com.tripnest.repository.ItineraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripService tripService;

    public ItineraryResponse createItinerary(String email, Long tripId, ItineraryRequest request) {
        Trip trip = tripService.findTripOrThrow(tripId);
        assertHasAccess(email, trip);

        Itinerary itinerary = Itinerary.builder()
                .trip(trip)
                .dayNumber(request.getDayNumber())
                .date(request.getDate())
                .notes(request.getNotes())
                .build();

        itineraryRepository.save(itinerary);
        return toResponse(itinerary);
    }

    public List<ItineraryResponse> getItinerariesForTrip(String email, Long tripId) {
        Trip trip = tripService.findTripOrThrow(tripId);
        assertHasAccess(email, trip);

        return itineraryRepository.findByTripIdOrderByDayNumberAsc(tripId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ItineraryResponse updateItinerary(String email, Long itineraryId, ItineraryRequest request) {
        Itinerary itinerary = findItineraryOrThrow(itineraryId);
        assertHasAccess(email, itinerary.getTrip());

        itinerary.setDayNumber(request.getDayNumber());
        itinerary.setDate(request.getDate());
        itinerary.setNotes(request.getNotes());

        itineraryRepository.save(itinerary);
        return toResponse(itinerary);
    }

    public void deleteItinerary(String email, Long itineraryId) {
        Itinerary itinerary = findItineraryOrThrow(itineraryId);
        assertHasAccess(email, itinerary.getTrip());
        itineraryRepository.delete(itinerary);
    }

    Itinerary findItineraryOrThrow(Long itineraryId) {
        return itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new IllegalArgumentException("Itinerary not found"));
    }

    private void assertHasAccess(String email, Trip trip) {
        boolean isOwner = trip.getOwner().getEmail().equalsIgnoreCase(email);
        boolean isTraveler = trip.getTravelers().stream()
                .anyMatch(t -> t.getEmail().equalsIgnoreCase(email));
        if (!isOwner && !isTraveler) {
            throw new AccessDeniedException("You do not have access to this trip's itinerary");
        }
    }

    private ItineraryResponse toResponse(Itinerary itinerary) {
        List<ActivityResponse> activityResponses = itinerary.getActivities().stream()
                .map(this::toActivityResponse)
                .toList();

        return new ItineraryResponse(
                itinerary.getId(),
                itinerary.getTrip().getId(),
                itinerary.getDayNumber(),
                itinerary.getDate(),
                itinerary.getNotes(),
                activityResponses
        );
    }

    private ActivityResponse toActivityResponse(Activity a) {
        return new ActivityResponse(
                a.getId(), a.getItinerary().getId(), a.getTitle(), a.getType(),
                a.getScheduledTime(), a.getLocation(), a.getNotes()
        );
    }
}
