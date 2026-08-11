package com.tripnest.service;

import com.tripnest.dto.TripInvitationRequest;
import com.tripnest.dto.TripInvitationResponse;
import com.tripnest.entity.GroupDiscussion;
import com.tripnest.entity.GroupMember;
import com.tripnest.entity.GroupRole;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TravelGroup;
import com.tripnest.entity.TripInvitation;
import com.tripnest.entity.TripInvitation.InvitationStatus;
import com.tripnest.entity.User;
import com.tripnest.repository.GroupDiscussionRepository;
import com.tripnest.repository.TravelGroupRepository;
import com.tripnest.repository.TripInvitationRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripInvitationService {

    private final TripInvitationRepository invitationRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TravelGroupRepository travelGroupRepository;
    private final GroupDiscussionRepository groupDiscussionRepository;

    /**
     * Sends an invitation using the request body (supports both inviteeId and inviteeUsername).
     * The inviterUsername is resolved from the JWT principal string (authentication.getName()).
     */
    @Transactional
    public TripInvitationResponse sendInvitation(Long tripId, String inviterUsername, TripInvitationRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User inviter = userRepository.findByUsername(inviterUsername)
                .orElseThrow(() -> new RuntimeException("Inviter not found: " + inviterUsername));

        // Resolve invitee by username (preferred) or by ID (legacy)
        User invitee;
        if (request.getInviteeUsername() != null && !request.getInviteeUsername().isBlank()) {
            invitee = userRepository.findByUsername(request.getInviteeUsername())
                    .orElseThrow(() -> new RuntimeException("User not found with username: " + request.getInviteeUsername()));
        } else if (request.getInviteeId() != null) {
            invitee = userRepository.findById(request.getInviteeId())
                    .orElseThrow(() -> new RuntimeException("Invitee not found with ID: " + request.getInviteeId()));
        } else {
            throw new RuntimeException("Either inviteeUsername or inviteeId must be provided");
        }

        // Check if invitation already exists
        if (invitationRepository.findByTripIdAndInviteeId(tripId, invitee.getId()).isPresent()) {
            throw new RuntimeException("Invitation already sent to this user");
        }

        // Check if inviter is the trip owner
        if (!trip.getUser().getId().equals(inviter.getId())) {
            throw new RuntimeException("Only trip owner can send invitations");
        }

        TripInvitation invitation = new TripInvitation();
        invitation.setTrip(trip);
        invitation.setInviter(inviter);
        invitation.setInvitee(invitee);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setMessage(request.getMessage());

        invitation = invitationRepository.save(invitation);

        // Create notification for invitee
        notificationService.createNotification(
            invitee.getId(),
            "Trip Invitation",
            String.format("%s has invited you to join the trip '%s' to %s",
                inviter.getUsername(), trip.getTitle(), trip.getDestination()),
            "TRIP_INVITE"
        );

        return mapToResponse(invitation);
    }

    @Transactional
    public TripInvitationResponse respondToInvitation(Long invitationId, String responderUsername, boolean accepted) {
        TripInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        User responder = userRepository.findByUsername(responderUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + responderUsername));

        if (!invitation.getInvitee().getId().equals(responder.getId())) {
            throw new RuntimeException("You can only respond to your own invitations");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation is no longer pending");
        }

        invitation.setStatus(accepted ? InvitationStatus.ACCEPTED : InvitationStatus.DECLINED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitation = invitationRepository.save(invitation);

        // If accepted, add user to trip's travel group and create a group chat
        if (accepted) {
            handleAcceptedInvitation(invitation);
        }

        // Notify inviter about response
        notificationService.createNotification(
            invitation.getInviter().getId(),
            "Invitation Response",
            String.format("%s has %s your invitation to join '%s'",
                invitation.getInvitee().getUsername(),
                accepted ? "accepted" : "declined",
                invitation.getTrip().getTitle()),
            "GROUP_UPDATE"
        );

        return mapToResponse(invitation);
    }

    /**
     * When a trip invitation is accepted:
     * 1. Find or create a TravelGroup linked to this trip.
     * 2. Add the invitee as a group member.
     * 3. Ensure a default "General Chat" discussion exists.
     * 4. Notify all existing group members.
     */
    private void handleAcceptedInvitation(TripInvitation invitation) {
        Trip trip = invitation.getTrip();
        User invitee = invitation.getInvitee();
        User tripOwner = trip.getUser();

        // Find or create the TravelGroup for this trip
        TravelGroup group = findOrCreateGroupForTrip(trip, tripOwner);

        // Add invitee as a member (if not already)
        boolean alreadyMember = group.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(invitee.getId()));

        if (!alreadyMember) {
            GroupMember newMember = new GroupMember();
            newMember.setTravelGroup(group);
            newMember.setUser(invitee);
            newMember.setRole(GroupRole.MEMBER);
            group.getMembers().add(newMember);
            travelGroupRepository.save(group);
        }

        // Ensure a default "General Chat" discussion exists
        List<GroupDiscussion> discussions = groupDiscussionRepository.findByTravelGroupIdOrderByCreatedAtDesc(group.getId());
        if (discussions.isEmpty()) {
            GroupDiscussion generalChat = new GroupDiscussion();
            generalChat.setTitle("General Chat");
            generalChat.setTravelGroup(group);
            generalChat.setCreatedBy(tripOwner);
            groupDiscussionRepository.save(generalChat);
        }

        // Notify the trip owner that someone joined
        notificationService.createNotification(
            tripOwner.getId(),
            "New Group Member",
            String.format("%s has joined your trip group for '%s'", invitee.getUsername(), trip.getTitle()),
            "GROUP_UPDATE"
        );

        // Notify the invitee that they have been added to the group
        notificationService.createNotification(
            invitee.getId(),
            "Added to Group",
            String.format("You have been added to the travel group for '%s'. You can now access the group chat!", trip.getTitle()),
            "GROUP_UPDATE"
        );
    }

    /**
     * Finds the TravelGroup linked to this trip (via trip_id FK on travel_groups), or creates one.
     */
    private TravelGroup findOrCreateGroupForTrip(Trip trip, User admin) {
        // Check if a group already exists for this trip using the repository
        Optional<TravelGroup> existingGroup = travelGroupRepository.findByTripId(trip.getId());
        if (existingGroup.isPresent()) {
            return existingGroup.get();
        }

        // Create a new group for this trip
        TravelGroup group = new TravelGroup();
        group.setName(trip.getTitle() + " Group");
        group.setDescription("Travel group for: " + trip.getTitle() + " to " + trip.getDestination());
        group.setAdmin(admin);
        group.setTrip(trip);

        TravelGroup savedGroup = travelGroupRepository.save(group);

        // Add admin as a member with ADMIN role
        GroupMember adminMember = new GroupMember();
        adminMember.setTravelGroup(savedGroup);
        adminMember.setUser(admin);
        adminMember.setRole(GroupRole.ADMIN);
        savedGroup.getMembers().add(adminMember);

        return travelGroupRepository.save(savedGroup);
    }

    public List<TripInvitationResponse> getPendingInvitations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        List<TripInvitation> invitations = invitationRepository.findByInviteeIdAndStatus(user.getId(), InvitationStatus.PENDING);
        return invitations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<TripInvitationResponse> getSentInvitations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        List<TripInvitation> invitations = invitationRepository.findByInviterId(user.getId());
        return invitations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<TripInvitationResponse> getTripInvitations(Long tripId) {
        List<TripInvitation> invitations = invitationRepository.findByTripId(tripId);
        return invitations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void cancelInvitation(Long invitationId, String cancellerUsername) {
        TripInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        User canceller = userRepository.findByUsername(cancellerUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + cancellerUsername));

        if (!invitation.getInviter().getId().equals(canceller.getId())) {
            throw new RuntimeException("You can only cancel your own invitations");
        }

        invitationRepository.delete(invitation);
    }

    private TripInvitationResponse mapToResponse(TripInvitation invitation) {
        TripInvitationResponse response = new TripInvitationResponse();
        response.setId(invitation.getId());
        response.setTripId(invitation.getTrip().getId());
        response.setTripTitle(invitation.getTrip().getTitle());
        response.setTripDestination(invitation.getTrip().getDestination());
        response.setInviterId(invitation.getInviter().getId());
        response.setInviterName(invitation.getInviter().getUsername());
        response.setInviteeId(invitation.getInvitee().getId());
        response.setInviteeName(invitation.getInvitee().getUsername());
        response.setStatus(invitation.getStatus());
        response.setCreatedAt(invitation.getCreatedAt());
        response.setRespondedAt(invitation.getRespondedAt());
        response.setMessage(invitation.getMessage());
        return response;
    }
}
