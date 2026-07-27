package com.tripnest.service.impl;

import com.tripnest.dto.trip.TripRequest;
import com.tripnest.dto.trip.TripResponse;
import com.tripnest.entity.Destination;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.entity.enums.TripStatus;
import com.tripnest.exception.InvalidRequestException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;

    @Override
    @Transactional
    public TripResponse createTrip(Long ownerId, TripRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));
        Destination destination = destinationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Destination not found with id: " + request.getDestinationId()));

        Trip trip = new Trip();
        trip.setOwner(owner);
        applyRequest(trip, destination, request);

        Trip saved = tripRepository.save(trip);
        return TripResponse.fromEntity(saved, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> getMyTrips(Long ownerId, TripStatus status) {
        List<Trip> trips = status == null
                ? tripRepository.findByOwnerIdOrderByStartDateAsc(ownerId)
                : tripRepository.findByOwnerIdAndStatusOrderByStartDateAsc(ownerId, status);

        return trips.stream()
                .map(trip -> TripResponse.fromEntity(trip, itineraryRepository.countByTripId(trip.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTrip(Long tripId, Long ownerId) {
        Trip trip = findOwnedTrip(tripId, ownerId);
        return TripResponse.fromEntity(trip, itineraryRepository.countByTripId(trip.getId()));
    }

    @Override
    @Transactional
    public TripResponse updateTrip(Long tripId, Long ownerId, TripRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        Trip trip = findOwnedTrip(tripId, ownerId);
        Destination destination = destinationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Destination not found with id: " + request.getDestinationId()));

        applyRequest(trip, destination, request);
        Trip saved = tripRepository.save(trip);
        return TripResponse.fromEntity(saved, itineraryRepository.countByTripId(saved.getId()));
    }

    @Override
    @Transactional
    public TripResponse updateStatus(Long tripId, Long ownerId, TripStatus status) {
        Trip trip = findOwnedTrip(tripId, ownerId);
        trip.setStatus(status);
        Trip saved = tripRepository.save(trip);
        return TripResponse.fromEntity(saved, itineraryRepository.countByTripId(saved.getId()));
    }

    @Override
    @Transactional
    public void deleteTrip(Long tripId, Long ownerId) {
        Trip trip = findOwnedTrip(tripId, ownerId);
        tripRepository.delete(trip);
    }

    private Trip findOwnedTrip(Long tripId, Long ownerId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        if (!trip.getOwner().getId().equals(ownerId)) {
            throw new AccessDeniedException("You do not have permission to access this trip");
        }
        return trip;
    }

    private void applyRequest(Trip trip, Destination destination, TripRequest request) {
        trip.setTitle(request.getTitle());
        trip.setDestination(destination);
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setTotalBudget(request.getTotalBudget());
        trip.setNotes(request.getNotes());
        trip.setShared(request.isShared());
    }

    private void validateDates(java.time.LocalDate start, java.time.LocalDate end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new InvalidRequestException("End date cannot be before start date");
        }
    }
}
