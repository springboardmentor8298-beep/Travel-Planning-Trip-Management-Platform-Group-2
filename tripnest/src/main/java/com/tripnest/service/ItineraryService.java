package com.tripnest.service;

import com.tripnest.dto.ActivityResponse;
import com.tripnest.dto.ItineraryRequest;
import com.tripnest.dto.ItineraryResponse;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import com.tripnest.entity.MemberStatus;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.TripMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for itinerary (day-plan) CRUD operations.
 * Validates that the trip belongs to the requesting user.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;
    private final ActivityService activityService;

    private Trip findTripWithAccess(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        
        boolean isOwner = trip.getUser().getId().equals(userId);
        boolean isMember = tripMemberRepository
                .findByTripIdAndUserId(tripId, userId)
                .map(m -> m.getStatus() == MemberStatus.ACCEPTED)
                .orElse(false);

        if (!isOwner && !isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this trip");
        }
        return trip;
    }

    public ItineraryResponse addItinerary(Long tripId, Long userId, ItineraryRequest request) {
        Trip trip = findTripWithAccess(tripId, userId);

        Itinerary itinerary = new Itinerary();
        itinerary.setTrip(trip);
        itinerary.setDayNumber(request.getDayNumber());
        itinerary.setDate(request.getDate());
        itinerary.setNotes(request.getNotes());

        return toResponse(itineraryRepository.save(itinerary));
    }

    @Transactional(readOnly = true)
    public List<ItineraryResponse> getTripItineraries(Long tripId, Long userId) {
        findTripWithAccess(tripId, userId);

        return itineraryRepository.findByTripIdOrderByDayNumberAsc(tripId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ItineraryResponse updateItinerary(Long itineraryId, Long tripId, Long userId, ItineraryRequest request) {
        findTripWithAccess(tripId, userId);

        Itinerary itinerary = itineraryRepository.findByIdAndTripId(itineraryId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));

        itinerary.setDayNumber(request.getDayNumber());
        itinerary.setDate(request.getDate());
        itinerary.setNotes(request.getNotes());

        return toResponse(itineraryRepository.save(itinerary));
    }

    public void deleteItinerary(Long itineraryId, Long tripId, Long userId) {
        findTripWithAccess(tripId, userId);

        Itinerary itinerary = itineraryRepository.findByIdAndTripId(itineraryId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));

        itineraryRepository.delete(itinerary);
    }

    public ItineraryResponse toResponse(Itinerary itinerary) {
        ItineraryResponse res = new ItineraryResponse();
        res.setId(itinerary.getId());
        res.setDayNumber(itinerary.getDayNumber());
        res.setDate(itinerary.getDate());
        res.setNotes(itinerary.getNotes());
        res.setTripId(itinerary.getTrip().getId());

        List<ActivityResponse> activities = itinerary.getActivities()
                .stream()
                .map(activityService::toResponse)
                .collect(Collectors.toList());
        res.setActivities(activities);

        return res;
    }
}
