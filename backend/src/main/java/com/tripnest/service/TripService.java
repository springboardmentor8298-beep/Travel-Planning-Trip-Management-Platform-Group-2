package com.tripnest.service;

import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import com.tripnest.entity.Destination;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {
    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;

    public TripService(TripRepository tripRepository,
                       DestinationRepository destinationRepository,
                       UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.destinationRepository = destinationRepository;
        this.userRepository = userRepository;
    }

    public TripResponse createTrip(TripRequest request, User user) {
        Trip trip = new Trip();
        String tripName = request.getName() != null ? request.getName() : request.getTitle();
        if (tripName == null || tripName.trim().isEmpty()) {
            throw new RuntimeException("Trip title/name is required");
        }
        trip.setName(tripName);
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setPhotoUrl(request.getPhotoUrl());
        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }

        if (request.getDestinationId() != null) {
            Destination dest = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found with id: " + request.getDestinationId()));
            trip.setDestination(dest);
            if (trip.getPhotoUrl() == null || trip.getPhotoUrl().isEmpty()) {
                trip.setPhotoUrl(dest.getPhotoUrl());
            }
        }

        User userToUse = user;
        if (userToUse == null) {
            userToUse = getCurrentUserOrFallback();
        }
        trip.setUser(userToUse);

        trip = tripRepository.save(trip);
        return toTripResponse(trip);
    }

    public TripResponse createTripPublic(TripRequest request) {
        return createTrip(request, null);
    }

    public List<TripResponse> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
    }

    public List<TripResponse> getUserTrips(User user) {
        if (user == null) {
            return getAllTrips();
        }
        return tripRepository.findByUser(user).stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
    }

    public List<TripResponse> getUserTripsOrAll(User user) {
        if (user == null) {
            return getAllTrips();
        }
        List<Trip> userTrips = tripRepository.findByUser(user);
        if (userTrips.isEmpty()) {
            return getAllTrips();
        }
        return userTrips.stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
    }

    public TripResponse getTripById(Long id, User user) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        return toTripResponse(trip);
    }

    public TripResponse getTripByIdPublic(Long id) {
        return getTripById(id, null);
    }

    public TripResponse updateTrip(Long id, TripRequest request, User user) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        if (request.getName() != null || request.getTitle() != null) {
            String newName = request.getName() != null ? request.getName() : request.getTitle();
            trip.setName(newName);
        }
        if (request.getDescription() != null) trip.setDescription(request.getDescription());
        if (request.getStartDate() != null) trip.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) trip.setEndDate(request.getEndDate());
        if (request.getPhotoUrl() != null) trip.setPhotoUrl(request.getPhotoUrl());
        if (request.getStatus() != null) trip.setStatus(request.getStatus());

        if (request.getDestinationId() != null) {
            Destination dest = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found with id: " + request.getDestinationId()));
            trip.setDestination(dest);
        }

        trip = tripRepository.save(trip);
        return toTripResponse(trip);
    }

    public TripResponse updateTripPublic(Long id, TripRequest request) {
        return updateTrip(id, request, null);
    }

    public void deleteTrip(Long id, User user) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        tripRepository.delete(trip);
    }

    public void deleteTripPublic(Long id) {
        deleteTrip(id, null);
    }

    private User getCurrentUserOrFallback() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                return (User) auth.getPrincipal();
            }
        } catch (Exception ignored) {}
        return userRepository.findByEmail("traveler@tripnest.com").orElseGet(() ->
                userRepository.findAll().stream().findFirst().orElse(null)
        );
    }

    private TripResponse toTripResponse(Trip trip) {
        TripResponse response = new TripResponse();
        response.setId(trip.getId());
        response.setName(trip.getName());
        response.setTitle(trip.getName());
        response.setDescription(trip.getDescription());
        response.setStartDate(trip.getStartDate());
        response.setEndDate(trip.getEndDate());
        response.setPhotoUrl(trip.getPhotoUrl());
        response.setStatus(trip.getStatus());
        if (trip.getDestination() != null) {
            response.setDestinationId(trip.getDestination().getId());
            response.setDestinationName(trip.getDestination().getName());
            response.setDestinationLocation(trip.getDestination().getLocation());
            response.setDestinationPhotoUrl(trip.getDestination().getPhotoUrl());
        }
        response.setCreatedAt(trip.getCreatedAt());
        response.setUpdatedAt(trip.getUpdatedAt());
        return response;
    }
}
