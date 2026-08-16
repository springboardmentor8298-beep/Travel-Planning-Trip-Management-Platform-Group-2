package com.tripnest.service;

import com.tripnest.dto.TripMemberRequest;
import com.tripnest.dto.TripMemberResponse;
import com.tripnest.entity.*;
import com.tripnest.repository.TripMemberRoleRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripMemberService {

    private final TripMemberRoleRepository tripMemberRoleRepository;
    private final UserRepository userRepository;
    private final TripAccessService tripAccessService;
    private final NotificationService notificationService;

    public TripMemberResponse inviteMember(String ownerEmail, Long tripId, TripMemberRequest request) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertIsOwner(ownerEmail, trip);

        // .trim() matters: a copy-pasted email with a trailing/leading space
        // fails an exact-length DB match even with case-insensitive lookup.
        String cleanEmail = request.getEmail().trim();
        User invitee = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No account found for \"" + cleanEmail + "\". They must register a TripNest account first."));

        TripMemberRole membership = tripMemberRoleRepository.findByTripIdAndUserId(tripId, invitee.getId())
                .orElseGet(() -> TripMemberRole.builder().trip(trip).user(invitee).build());
        membership.setRole(request.getRole());
        tripMemberRoleRepository.save(membership);

        // Keep the legacy travelers set in sync so Milestone 2 access checks
        // (getMyTrips, dashboard, itinerary) also recognize this member.
        trip.getTravelers().add(invitee);

        notificationService.send(
                invitee,
                NotificationType.GROUP_INVITE,
                "You were added to trip \"" + trip.getTitle() + "\" as " + request.getRole() + ".",
                trip.getId()
        );

        return toResponse(membership);
    }

    public List<TripMemberResponse> getMembers(String email, Long tripId) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertHasAccess(email, trip);

        return tripMemberRoleRepository.findByTripId(tripId).stream()
                .map(this::toResponse)
                .toList();
    }

    public TripMemberResponse updateMemberRole(String ownerEmail, Long tripId, Long userId, TripRole newRole) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertIsOwner(ownerEmail, trip);

        TripMemberRole membership = tripMemberRoleRepository.findByTripIdAndUserId(tripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("This user is not a member of the trip"));
        membership.setRole(newRole);
        tripMemberRoleRepository.save(membership);
        return toResponse(membership);
    }

    private TripMemberResponse toResponse(TripMemberRole m) {
        return new TripMemberResponse(
                m.getUser().getId(), m.getUser().getEmail(), m.getUser().getFullName(), m.getRole()
        );
    }
}
