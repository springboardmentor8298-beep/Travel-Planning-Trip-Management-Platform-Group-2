package com.tripnest.service;

import com.tripnest.dto.TripMemberRequest;
import com.tripnest.dto.TripMemberResponse;
import com.tripnest.entity.*;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for trip collaboration — member invites, accept/decline, removal.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CollaborationService {

    private final TripMemberRepository tripMemberRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // -------------------------------------------------------------------------
    // Invite
    // -------------------------------------------------------------------------

    public TripMemberResponse inviteMember(Long tripId, Long inviterId, TripMemberRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        // Only the trip owner can invite
        if (!trip.getUser().getId().equals(inviterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the trip owner can invite members");
        }

        // Resolve the invited user by username or email
        String identifier = request.getUsernameOrEmail();
        User invitedUser = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + identifier));

        if (invitedUser.getId().equals(inviterId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot invite yourself");
        }

        if (tripMemberRepository.existsByTripIdAndUserId(tripId, invitedUser.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already invited or is a member");
        }

        TripMember member = new TripMember();
        member.setTrip(trip);
        member.setUser(invitedUser);
        member.setRole(MemberRole.MEMBER);
        member.setStatus(MemberStatus.PENDING);
        TripMember saved = tripMemberRepository.save(member);

        // Send notification to invited user
        notificationService.createNotification(
                invitedUser.getId(),
                NotificationType.GROUP_INVITE,
                "Trip Invitation",
                "You've been invited to join trip: " + trip.getTitle(),
                tripId
        );

        return toResponse(saved);
    }

    // -------------------------------------------------------------------------
    // Accept / Decline
    // -------------------------------------------------------------------------

    public TripMemberResponse acceptInvite(Long tripId, Long memberId, Long userId) {
        TripMember member = findMember(tripId, memberId, userId);
        if (member.getStatus() != MemberStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invite is not pending");
        }
        member.setStatus(MemberStatus.ACCEPTED);
        member.setJoinedAt(LocalDateTime.now());
        return toResponse(tripMemberRepository.save(member));
    }

    public TripMemberResponse declineInvite(Long tripId, Long memberId, Long userId) {
        TripMember member = findMember(tripId, memberId, userId);
        member.setStatus(MemberStatus.DECLINED);
        return toResponse(tripMemberRepository.save(member));
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<TripMemberResponse> getMembers(Long tripId) {
        return tripMemberRepository.findByTripId(tripId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Remove
    // -------------------------------------------------------------------------

    public void removeMember(Long tripId, Long memberId, Long requesterId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        TripMember member = tripMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        // Only trip owner can remove, or the member can remove themselves
        if (!trip.getUser().getId().equals(requesterId) && !member.getUser().getId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        tripMemberRepository.delete(member);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private TripMember findMember(Long tripId, Long memberId, Long userId) {
        TripMember member = tripMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
        if (!member.getTrip().getId().equals(tripId) || !member.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        return member;
    }

    public TripMemberResponse toResponse(TripMember m) {
        TripMemberResponse res = new TripMemberResponse();
        res.setId(m.getId());
        res.setTripId(m.getTrip().getId());
        res.setUserId(m.getUser().getId());
        res.setUsername(m.getUser().getUsername());
        res.setEmail(m.getUser().getEmail());
        res.setRole(m.getRole());
        res.setStatus(m.getStatus());
        res.setInvitedAt(m.getInvitedAt());
        res.setJoinedAt(m.getJoinedAt());
        return res;
    }
}
