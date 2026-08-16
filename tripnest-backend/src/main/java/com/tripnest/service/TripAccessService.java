package com.tripnest.service;

import com.tripnest.entity.Trip;
import com.tripnest.entity.TripRole;
import com.tripnest.repository.TripMemberRoleRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

/**
 * Single source of truth for "does this user have access to this trip"
 * across Milestone 3 features (Budget, Expenses, Documents, Group roles).
 *
 * Recognizes access via EITHER mechanism so nothing built in Milestone 2
 * breaks:
 *   1. Legacy: Trip.owner or Trip.travelers (the simple set from Milestone 2)
 *   2. New:    TripMemberRole (OWNER/EDITOR/VIEWER) added in Milestone 3
 */
@Service
@RequiredArgsConstructor
public class TripAccessService {

    private final TripRepository tripRepository;
    private final TripMemberRoleRepository tripMemberRoleRepository;
    private final UserRepository userRepository;

    public Trip findTripOrThrow(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
    }

    /** Any member (owner, legacy traveler, or role-assigned member) can view. */
    public void assertHasAccess(String email, Trip trip) {
        if (!hasAccess(email, trip)) {
            throw new AccessDeniedException("You do not have access to this trip");
        }
    }

    public boolean hasAccess(String email, Trip trip) {
        boolean isOwner = trip.getOwner().getEmail().equalsIgnoreCase(email);
        boolean isLegacyTraveler = trip.getTravelers().stream()
                .anyMatch(t -> t.getEmail().equalsIgnoreCase(email));
        boolean hasRoleEntry = userRepository.findByEmail(email)
                .map(u -> tripMemberRoleRepository.findByTripIdAndUserId(trip.getId(), u.getId()).isPresent())
                .orElse(false);
        return isOwner || isLegacyTraveler || hasRoleEntry;
    }

    /** Only the trip owner, or a member explicitly given the EDITOR role, can modify. */
    public void assertCanEdit(String email, Trip trip) {
        boolean isOwner = trip.getOwner().getEmail().equalsIgnoreCase(email);
        if (isOwner) return;

        boolean isEditor = userRepository.findByEmail(email)
                .flatMap(u -> tripMemberRoleRepository.findByTripIdAndUserId(trip.getId(), u.getId()))
                .map(m -> m.getRole() == TripRole.EDITOR || m.getRole() == TripRole.OWNER)
                .orElse(false);

        // Fall back to legacy traveler access for trips created before Milestone 3
        // (no TripMemberRole rows yet) so existing trips keep working.
        boolean isLegacyTraveler = trip.getTravelers().stream()
                .anyMatch(t -> t.getEmail().equalsIgnoreCase(email));

        if (!isEditor && !isLegacyTraveler) {
            throw new AccessDeniedException("You do not have permission to modify this trip");
        }
    }

    public void assertIsOwner(String email, Trip trip) {
        if (!trip.getOwner().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("Only the trip owner can perform this action");
        }
    }
}
