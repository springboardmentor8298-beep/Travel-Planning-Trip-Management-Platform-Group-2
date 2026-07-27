package com.tripnest.service.impl;

import com.tripnest.dto.activity.ActivityResponse;
import com.tripnest.dto.itinerary.ItineraryDayRequest;
import com.tripnest.dto.itinerary.ItineraryDayResponse;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import com.tripnest.exception.InvalidRequestException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.service.ItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItineraryServiceImpl implements ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;

    @Override
    @Transactional
    public List<ItineraryDayResponse> generateForTrip(Long tripId, Long ownerId) {
        Trip trip = findOwnedTrip(tripId, ownerId);

        if (itineraryRepository.countByTripId(tripId) > 0) {
            throw new InvalidRequestException(
                    "This trip already has itinerary days. Delete them first to regenerate.");
        }

        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        LocalDate cursor = trip.getStartDate();

        for (int day = 1; day <= totalDays; day++) {
            Itinerary itinerary = new Itinerary();
            itinerary.setTrip(trip);
            itinerary.setDayNumber(day);
            itinerary.setDate(cursor);
            itinerary.setTitle("Day " + day);
            itineraryRepository.save(itinerary);
            cursor = cursor.plusDays(1);
        }

        return getDaysForTrip(tripId, ownerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItineraryDayResponse> getDaysForTrip(Long tripId, Long ownerId) {
        findOwnedTrip(tripId, ownerId);
        return itineraryRepository.findByTripIdOrderByDayNumberAsc(tripId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ItineraryDayResponse addDay(Long tripId, Long ownerId, ItineraryDayRequest request) {
        Trip trip = findOwnedTrip(tripId, ownerId);

        int nextDayNumber = (int) itineraryRepository.countByTripId(tripId) + 1;

        Itinerary itinerary = new Itinerary();
        itinerary.setTrip(trip);
        itinerary.setDayNumber(nextDayNumber);
        itinerary.setDate(request.getDate());
        itinerary.setTitle(request.getTitle() != null ? request.getTitle() : "Day " + nextDayNumber);
        itinerary.setNotes(request.getNotes());

        Itinerary saved = itineraryRepository.save(itinerary);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ItineraryDayResponse updateDay(Long tripId, Long dayId, Long ownerId, ItineraryDayRequest request) {
        findOwnedTrip(tripId, ownerId);
        Itinerary itinerary = findDay(tripId, dayId);

        itinerary.setDate(request.getDate());
        if (request.getTitle() != null) {
            itinerary.setTitle(request.getTitle());
        }
        itinerary.setNotes(request.getNotes());

        Itinerary saved = itineraryRepository.save(itinerary);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDay(Long tripId, Long dayId, Long ownerId) {
        findOwnedTrip(tripId, ownerId);
        Itinerary itinerary = findDay(tripId, dayId);
        itineraryRepository.delete(itinerary);
    }

    private ItineraryDayResponse toResponse(Itinerary itinerary) {
        List<ActivityResponse> activities = activityRepository
                .findByItineraryIdOrderByStartTimeAsc(itinerary.getId()).stream()
                .map(ActivityResponse::fromEntity)
                .toList();
        return ItineraryDayResponse.fromEntity(itinerary, activities);
    }

    private Trip findOwnedTrip(Long tripId, Long ownerId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        if (!trip.getOwner().getId().equals(ownerId)) {
            throw new AccessDeniedException("You do not have permission to access this trip");
        }
        return trip;
    }

    private Itinerary findDay(Long tripId, Long dayId) {
        return itineraryRepository.findByIdAndTripId(dayId, tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found with id: " + dayId));
    }
}
