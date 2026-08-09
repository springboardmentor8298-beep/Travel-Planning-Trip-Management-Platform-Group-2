package com.tripnest.service;

import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import com.tripnest.dto.TripStatsResponse;
import com.tripnest.entity.MemberStatus;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TripStatus;
import com.tripnest.entity.User;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for trip CRUD operations.
 * All operations are scoped to the authenticated user.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public TripResponse createTrip(Long userId, TripRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Trip trip = new Trip();
        trip.setUser(user);
        applyRequest(trip, request);

        return toResponse(tripRepository.save(trip), false);
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<TripResponse> getUserTrips(Long userId) {
        // Collect owned trips first (preserves order)
        Map<Long, TripResponse> tripMap = new LinkedHashMap<>();
        tripRepository.findByUserIdOrderByStartDateDesc(userId)
                .forEach(t -> tripMap.put(t.getId(), toResponse(t, false)));

        // Also include trips where this user is an accepted collaborator
        tripMemberRepository.findByUserIdAndStatus(userId, MemberStatus.ACCEPTED)
                .stream()
                .map(m -> m.getTrip())
                .filter(t -> !tripMap.containsKey(t.getId()))
                .map(t -> toResponse(t, false))
                .forEach(r -> tripMap.put(r.getId(), r));

        return new ArrayList<>(tripMap.values());
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        // Allow access if the user is the trip owner OR an accepted member
        boolean isOwner = trip.getUser().getId().equals(userId);
        boolean isMember = tripMemberRepository
                .findByTripIdAndUserId(tripId, userId)
                .map(m -> m.getStatus() == MemberStatus.ACCEPTED)
                .orElse(false);

        if (!isOwner && !isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this trip");
        }

        return toResponse(trip, true);
    }

    @Transactional(readOnly = true)
    public TripStatsResponse getStats(Long userId) {
        // Count owned trips per status
        long planned   = tripRepository.countByUserIdAndStatus(userId, TripStatus.PLANNED);
        long ongoing   = tripRepository.countByUserIdAndStatus(userId, TripStatus.ONGOING);
        long completed = tripRepository.countByUserIdAndStatus(userId, TripStatus.COMPLETED);
        long cancelled = tripRepository.countByUserIdAndStatus(userId, TripStatus.CANCELLED);

        // Add accepted collaborator trips to each status bucket
        List<Trip> memberTrips = tripMemberRepository
                .findByUserIdAndStatus(userId, MemberStatus.ACCEPTED)
                .stream()
                .map(m -> m.getTrip())
                .filter(t -> !t.getUser().getId().equals(userId)) // not already counted as owner
                .collect(Collectors.toList());

        for (Trip t : memberTrips) {
            switch (t.getStatus()) {
                case PLANNED   -> planned++;
                case ONGOING   -> ongoing++;
                case COMPLETED -> completed++;
                case CANCELLED -> cancelled++;
            }
        }

        long total = tripRepository.countByUserId(userId) + memberTrips.size();
        return new TripStatsResponse(total, planned, ongoing, completed, cancelled);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public TripResponse updateTrip(Long tripId, Long userId, TripRequest request) {
        Trip trip = tripRepository.findByIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        applyRequest(trip, request);
        return toResponse(tripRepository.save(trip), false);
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public void deleteTrip(Long tripId, Long userId) {
        Trip trip = tripRepository.findByIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        tripRepository.delete(trip);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void applyRequest(Trip trip, TripRequest req) {
        trip.setTitle(req.getTitle());
        trip.setDestination(req.getDestination());
        trip.setStartDate(req.getStartDate());
        trip.setEndDate(req.getEndDate());
        trip.setBudget(req.getBudget());
        trip.setDescription(req.getDescription());
        trip.setNumberOfTravelers(req.getNumberOfTravelers() <= 0 ? 1 : req.getNumberOfTravelers());
        if (req.getStatus() != null) {
            trip.setStatus(req.getStatus());
        }
    }

    public TripResponse toResponse(Trip trip, boolean includeItineraries) {
        TripResponse res = new TripResponse();
        res.setId(trip.getId());
        res.setTitle(trip.getTitle());
        res.setDestination(trip.getDestination());
        res.setStartDate(trip.getStartDate());
        res.setEndDate(trip.getEndDate());
        res.setBudget(trip.getBudget());
        res.setStatus(trip.getStatus());
        res.setDescription(trip.getDescription());
        res.setNumberOfTravelers(trip.getNumberOfTravelers());
        res.setUserId(trip.getUser().getId());
        res.setUsername(trip.getUser().getUsername());

        // Compute duration
        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            res.setDurationDays((int) (trip.getEndDate().toEpochDay() - trip.getStartDate().toEpochDay()) + 1);
        }

        return res;
    }
}
