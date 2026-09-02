package com.tripnest.service;

import com.tripnest.dto.*;
import com.tripnest.entity.Destination;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final ItineraryRepository itineraryRepository;
    private final ActivityRepository activityRepository;

    public TripResponse createTrip(String ownerEmail, TripRequest request) {
        User owner = findUserOrThrow(ownerEmail);

        Destination destination = null;
        if (request.getDestinationId() != null) {
            destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new IllegalArgumentException("Destination not found"));
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        Trip trip = Trip.builder()
                .title(request.getTitle())
                .destination(destination)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .budget(request.getBudget())
                .owner(owner)
                .build();

        tripRepository.save(trip);
        return toResponse(trip);
    }

    public List<TripResponse> getMyTrips(String email) {
        User user = findUserOrThrow(email);
        return tripRepository.findAllAccessibleByUser(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public TripResponse getTrip(String email, Long tripId) {
        Trip trip = findTripOrThrow(tripId);
        assertHasAccess(email, trip);
        return toResponse(trip);
    }

    public TripResponse updateTrip(String email, Long tripId, TripRequest request) {
        Trip trip = findTripOrThrow(tripId);
        assertIsOwner(email, trip);

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        trip.setTitle(request.getTitle());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudget(request.getBudget());

        if (request.getDestinationId() != null) {
            Destination destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new IllegalArgumentException("Destination not found"));
            trip.setDestination(destination);
        }

        tripRepository.save(trip);
        return toResponse(trip);
    }

    public void deleteTrip(String email, Long tripId) {
        Trip trip = findTripOrThrow(tripId);
        assertIsOwner(email, trip);
        tripRepository.delete(trip);
    }

    public TripResponse addTraveler(String email, Long tripId, AddTravelerRequest request) {
        Trip trip = findTripOrThrow(tripId);
        assertIsOwner(email, trip);

        User traveler = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No user found with that email"));

        trip.getTravelers().add(traveler);
        tripRepository.save(trip);
        return toResponse(trip);
    }

    public TripDashboardResponse getDashboard(String email, Long tripId) {
        Trip trip = findTripOrThrow(tripId);
        assertHasAccess(email, trip);

        long totalPlannedDays = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        long plannedItineraryDays = itineraryRepository.findByTripIdOrderByDayNumberAsc(tripId).size();
        long totalActivities = itineraryRepository.findByTripIdOrderByDayNumberAsc(tripId).stream()
                .mapToLong(itinerary -> activityRepository.findByItineraryIdOrderByScheduledTimeAsc(itinerary.getId()).size())
                .sum();

        return new TripDashboardResponse(
                trip.getId(),
                trip.getTitle(),
                totalPlannedDays,
                plannedItineraryDays,
                totalActivities,
                trip.getBudget() != null ? trip.getBudget() : 0.0,
                trip.getStatus().name()
        );
    }

    // ---- helpers ----

    Trip findTripOrThrow(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
    }

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void assertIsOwner(String email, Trip trip) {
        if (!trip.getOwner().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("Only the trip owner can perform this action");
        }
    }

    private void assertHasAccess(String email, Trip trip) {
        boolean isOwner = trip.getOwner().getEmail().equalsIgnoreCase(email);
        boolean isTraveler = trip.getTravelers().stream()
                .anyMatch(t -> t.getEmail().equalsIgnoreCase(email));
        if (!isOwner && !isTraveler) {
            throw new AccessDeniedException("You do not have access to this trip");
        }
    }

    private TripResponse toResponse(Trip trip) {
        DestinationResponse destinationResponse = null;
        if (trip.getDestination() != null) {
            Destination d = trip.getDestination();
            destinationResponse = new DestinationResponse(
                    d.getId(), d.getName(), d.getCountry(), d.getDescription(),
                    d.getImageUrl(), d.getPopularAttractions()
            );
        }
        return new TripResponse(
                trip.getId(),
                trip.getTitle(),
                destinationResponse,
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getBudget(),
                trip.getStatus(),
                trip.getOwner().getEmail(),
                trip.getTravelers().size()
        );
    }
}
