package com.tripnest.backend.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.InviteMemberRequest;
import com.tripnest.backend.dto.response.TripMemberResponse;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.TripMember;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.enums.NotificationType;
import com.tripnest.backend.exception.BadRequestException;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.TripMemberRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.NotificationService;
import com.tripnest.backend.service.TripMemberService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripMemberServiceImpl implements TripMemberService {

    private final TripMemberRepository tripMemberRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private TripMemberResponse mapToResponse(TripMember member) {
        return TripMemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .email(member.getEmail())
                .role(member.getRole())
                .status(member.getStatus())
                .tripId(member.getTrip() != null ? member.getTrip().getId() : null)
                .tripName(member.getTrip() != null ? member.getTrip().getTripName() : "")
                .build();
    }

    private void validateOwnerPermission(Trip trip, User currentUser) {
        if (trip.getUser().getId().equals(currentUser.getId())) {
            return;
        }
        // The creator is the owner. In addition, check the trip_members table.
        TripMember member = tripMemberRepository.findByTripAndUser(trip, currentUser)
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this trip"));
        if (!"OWNER".equalsIgnoreCase(member.getRole())) {
            throw new AccessDeniedException("Only the trip OWNER can perform this action");
        }
    }

    @Override
    @Transactional
    public ApiResponse<TripMemberResponse> inviteMember(Long tripId, InviteMemberRequest request) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        validateOwnerPermission(trip, currentUser);

        if (currentUser.getEmail().equalsIgnoreCase(request.getEmail())) {
            throw new BadRequestException("You cannot invite yourself to the trip");
        }

        Optional<TripMember> existing = tripMemberRepository.findByTripAndEmail(trip, request.getEmail());
        if (existing.isPresent()) {
            throw new BadRequestException("User has already been invited or is a member of this trip");
        }

        // Check if user exists in system
        Optional<User> invitedUserOpt = userRepository.findByEmail(request.getEmail());

        TripMember newMember = TripMember.builder()
                .trip(trip)
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .role(request.getRole().toUpperCase())
                .status("PENDING")
                .user(invitedUserOpt.orElse(null))
                .build();

        newMember = tripMemberRepository.save(newMember);

        // Notify the invited user if they exist in the system
        if (invitedUserOpt.isPresent()) {
            User invitedUser = invitedUserOpt.get();
            notificationService.createNotification(
                    invitedUser,
                    "Trip Invitation",
                    "You have been invited by " + currentUser.getFullName() + " to join the trip: " + trip.getTripName(),
                    NotificationType.GROUP_INVITATION,
                    trip.getId(),
                    "TRIP"
            );
        }

        return ApiResponse.<TripMemberResponse>builder()
                .success(true)
                .message("Member invited successfully")
                .data(mapToResponse(newMember))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<String> removeMember(Long tripId, Long memberId) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        validateOwnerPermission(trip, currentUser);

        TripMember memberToRemove = tripMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!memberToRemove.getTrip().getId().equals(tripId)) {
            throw new BadRequestException("Member does not belong to this trip");
        }

        if ("OWNER".equalsIgnoreCase(memberToRemove.getRole())) {
            throw new BadRequestException("The OWNER of the trip cannot be removed");
        }

        tripMemberRepository.delete(memberToRemove);

        // Notify user if linked
        if (memberToRemove.getUser() != null) {
            notificationService.createNotification(
                    memberToRemove.getUser(),
                    "Removed from Trip",
                    "You have been removed from the trip: " + trip.getTripName(),
                    NotificationType.SYSTEM_NOTIFICATION,
                    tripId,
                    "TRIP"
            );
        }

        return ApiResponse.<String>builder()
                .success(true)
                .message("Member removed successfully")
                .data("Member removed successfully")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<TripMemberResponse>> getMembers(Long tripId) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        // Verify currentUser is either owner of the trip OR a member of the trip
        boolean isMember = trip.getUser().getId().equals(currentUser.getId()) ||
                tripMemberRepository.findByTripAndUser(trip, currentUser).isPresent();

        if (!isMember) {
            throw new AccessDeniedException("You do not have permission to view members of this trip");
        }

        List<TripMemberResponse> members = tripMemberRepository.findByTrip(trip)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<TripMemberResponse>>builder()
                .success(true)
                .message("Members retrieved successfully")
                .data(members)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<String> acceptInvitation(Long memberId) {
        User currentUser = getCurrentUser();
        TripMember member = tripMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!member.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new AccessDeniedException("This invitation is not for you");
        }

        member.setStatus("ACCEPTED");
        member.setUser(currentUser);
        tripMemberRepository.save(member);

        // Notify trip owner
        User owner = member.getTrip().getUser();
        notificationService.createNotification(
                owner,
                "Invitation Accepted",
                currentUser.getFullName() + " has accepted your invitation to join the trip: " + member.getTrip().getTripName(),
                NotificationType.GROUP_INVITATION,
                member.getTrip().getId(),
                "TRIP"
            );

        return ApiResponse.<String>builder()
                .success(true)
                .message("Invitation accepted successfully")
                .data("Invitation accepted successfully")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<String> declineInvitation(Long memberId) {
        User currentUser = getCurrentUser();
        TripMember member = tripMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!member.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new AccessDeniedException("This invitation is not for you");
        }

        tripMemberRepository.delete(member);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Invitation declined successfully")
                .data("Invitation declined successfully")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<TripMemberResponse>> getMyPendingInvitations() {
        User currentUser = getCurrentUser();
        List<TripMemberResponse> pending = tripMemberRepository.findByEmailAndStatus(currentUser.getEmail(), "PENDING")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<TripMemberResponse>>builder()
                .success(true)
                .message("Pending invitations retrieved successfully")
                .data(pending)
                .build();
    }
}
