package com.tripnest.service.impl;

import com.tripnest.dto.TripMemberDTO;
import com.tripnest.entity.Notification;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TripMember;
import com.tripnest.entity.User;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedException;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.service.NotificationService;
import com.tripnest.service.TripMemberService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripMemberServiceImpl implements TripMemberService {

    private final TripMemberRepository tripMemberRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TripMemberServiceImpl(TripMemberRepository tripMemberRepository,
                                 TripRepository tripRepository,
                                 UserRepository userRepository,
                                 NotificationService notificationService) {
        this.tripMemberRepository = tripMemberRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    public List<TripMemberDTO> getTripMembers(Integer tripId, String currentUserEmail) {
        if (!isUserOwnerOrMember(tripId, currentUserEmail)) {
            throw new UnauthorizedException("You are not authorized to view members of this trip.");
        }

        List<TripMember> members = tripMemberRepository.findByTrip_TripId(tripId);
        return members.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TripMemberDTO addTripMember(Integer tripId, String memberEmail, String role, String currentUserEmail) {
        if (!isUserOwner(tripId, currentUserEmail)) {
            throw new UnauthorizedException("Only the trip owner can invite members.");
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        User newMemberUser = userRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + memberEmail));

        // Check if already a member
        if (tripMemberRepository.existsByTrip_TripIdAndUser_UserId(tripId, newMemberUser.getUserId())) {
            throw new IllegalArgumentException("User is already a member of this trip.");
        }

        String assignedRole = (role != null && "OWNER".equalsIgnoreCase(role)) ? "OWNER" : "MEMBER";

        TripMember member = new TripMember(trip, newMemberUser, assignedRole);
        TripMember savedMember = tripMemberRepository.save(member);

        // Notify added user
        Notification notification = new Notification();
        notification.setUser(newMemberUser);
        notification.setNotificationTitle("Added to Shared Trip");
        notification.setMessage("You have been added as a " + assignedRole.toLowerCase() + " to trip '" + trip.getTripName() + "'.");
        notification.setNotificationType("SHARED_TRIP_ADDED");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationService.saveNotification(notification);

        return mapToDTO(savedMember);
    }

    @Override
    @Transactional
    public void removeTripMember(Integer tripId, Integer targetUserId, String currentUserEmail) {
        if (!isUserOwner(tripId, currentUserEmail)) {
            throw new UnauthorizedException("Only the trip owner can remove members.");
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        // Cannot remove creator/owner if target is trip.getUser()
        if (trip.getUser().getUserId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot remove the primary trip owner.");
        }

        TripMember member = tripMemberRepository.findByTrip_TripIdAndUser_UserId(tripId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in trip."));

        tripMemberRepository.delete(member);

        // Notify removed user
        User targetUser = userRepository.findById(targetUserId).orElse(null);
        if (targetUser != null) {
            Notification notification = new Notification();
            notification.setUser(targetUser);
            notification.setNotificationTitle("Removed from Shared Trip");
            notification.setMessage("You have been removed from trip '" + trip.getTripName() + "'.");
            notification.setNotificationType("SHARED_TRIP_REMOVED");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationService.saveNotification(notification);
        }
    }

    @Override
    public boolean isUserOwnerOrMember(Integer tripId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return false;

        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return false;

        if (trip.getUser().getUserId().equals(user.getUserId())) {
            return true;
        }

        return tripMemberRepository.existsByTrip_TripIdAndUser_UserId(tripId, user.getUserId());
    }

    @Override
    public boolean isUserOwner(Integer tripId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return false;

        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return false;

        if (trip.getUser().getUserId().equals(user.getUserId())) {
            return true;
        }

        return tripMemberRepository.findByTrip_TripIdAndUser_UserId(tripId, user.getUserId())
                .map(m -> "OWNER".equalsIgnoreCase(m.getRole()))
                .orElse(false);
    }

    private TripMemberDTO mapToDTO(TripMember member) {
        TripMemberDTO dto = new TripMemberDTO();
        dto.setMemberId(member.getMemberId());
        dto.setTripId(member.getTrip().getTripId());
        dto.setUserId(member.getUser().getUserId());
        dto.setEmail(member.getUser().getEmail());
        dto.setFirstName(member.getUser().getFirstName());
        dto.setLastName(member.getUser().getLastName());
        dto.setProfileImage(member.getUser().getProfileImage());
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        return dto;
    }
}
