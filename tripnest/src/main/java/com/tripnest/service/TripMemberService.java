package com.tripnest.service;

import com.tripnest.dto.TripMemberRequest;
import com.tripnest.dto.TripMemberResponse;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TripMember;
import com.tripnest.entity.TripMemberRole;
import com.tripnest.entity.User;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripMemberService {

    private final TripMemberRepository tripMemberRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TripMemberService(
            TripMemberRepository tripMemberRepository,
            TripRepository tripRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.tripMemberRepository = tripMemberRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }


    // ==========================================
    // ADD MEMBER
    // ==========================================

    @Transactional
    public TripMemberResponse addMember(
            Long tripId,
            TripMemberRequest request,
            Long currentUserId) {

        // Find trip
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));


        // Only trip owner can add members
        if (trip.getUser() == null ||
                !trip.getUser().getId().equals(currentUserId)) {

            throw new RuntimeException(
                    "Only the trip owner can add members");
        }


        // Find user
        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with username: "
                                        + request.getUsername()));


        // Prevent owner from adding themselves
        if (user.getId().equals(currentUserId)) {

            throw new RuntimeException(
                    "Trip owner is already a member");
        }


        // Prevent duplicate member
        if (tripMemberRepository
                .existsByTripIdAndUserId(
                        tripId,
                        user.getId())) {

            throw new RuntimeException(
                    "User is already a member of this trip");
        }


        // Create membership
        TripMember member = new TripMember();

        member.setTrip(trip);
        member.setUser(user);
        member.setRole(TripMemberRole.MEMBER);

        TripMember savedMember =
                tripMemberRepository.save(member);


        // ==========================================
        // CREATE NOTIFICATION FOR NEW MEMBER
        // ==========================================

        String ownerName =
                trip.getUser().getUsername();

        String tripTitle =
                trip.getTitle();

        notificationService.createNotification(
                user.getId(),
                tripId,
                ownerName +
                        " added you to the trip \"" +
                        tripTitle +
                        "\".",
                "COLLABORATION"
        );


        return convertToResponse(savedMember);
    }


    // ==========================================
    // GET MEMBERS
    // ==========================================

    @Transactional(readOnly = true)
    public List<TripMemberResponse> getMembers(
            Long tripId,
            Long currentUserId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));


        // Only owner can view members
        if (trip.getUser() == null ||
                !trip.getUser().getId().equals(currentUserId)) {

            throw new RuntimeException(
                    "You are not authorized to view members");
        }


        return tripMemberRepository
                .findByTripId(tripId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }


    // ==========================================
    // REMOVE MEMBER
    // ==========================================

    @Transactional
    public void removeMember(
            Long tripId,
            Long userId,
            Long currentUserId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));


        // Only owner can remove members
        if (trip.getUser() == null ||
                !trip.getUser().getId().equals(currentUserId)) {

            throw new RuntimeException(
                    "Only the trip owner can remove members");
        }


        // Find member
        TripMember member =
                tripMemberRepository
                        .findByTripIdAndUserId(
                                tripId,
                                userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Member not found"));


        // Delete member
        tripMemberRepository.delete(member);


        // ==========================================
        // NOTIFY REMOVED MEMBER
        // ==========================================

        notificationService.createNotification(
                userId,
                tripId,
                "You were removed from the trip \"" +
                        trip.getTitle() +
                        "\".",
                "COLLABORATION"
        );
    }


    // ==========================================
    // CONVERT ENTITY → RESPONSE
    // ==========================================

    private TripMemberResponse convertToResponse(
            TripMember member) {

        User user = member.getUser();

        return new TripMemberResponse(
                member.getId(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                member.getRole().name(),
                member.getJoinedAt()
        );
    }
}