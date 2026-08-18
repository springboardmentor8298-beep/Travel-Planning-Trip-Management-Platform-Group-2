package com.tripnest.service;

import com.tripnest.dto.TripInvitationResponse;
import com.tripnest.exception.AccessDeniedCustomException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.Notification;
import com.tripnest.model.Trip;
import com.tripnest.model.TripInvitation;
import com.tripnest.model.User;
import com.tripnest.repository.TripInvitationRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TripInvitationService {

    private final TripInvitationRepository invRepo;
    private final TripRepository           tripRepo;
    private final UserRepository           userRepo;
    private final NotificationService      notifService;

    public TripInvitationService(TripInvitationRepository invRepo,
                                 TripRepository tripRepo,
                                 UserRepository userRepo,
                                 NotificationService notifService) {
        this.invRepo      = invRepo;
        this.tripRepo     = tripRepo;
        this.userRepo     = userRepo;
        this.notifService = notifService;
    }

    /* ── Send invitation ── */
    public TripInvitationResponse invite(String ownerEmail, Long tripId, String inviteeEmail) {
        User owner = findUser(ownerEmail);
        Trip trip  = findTrip(tripId);

        if (!trip.getOwner().getEmail().equalsIgnoreCase(ownerEmail)) {
            throw new AccessDeniedCustomException("Only the trip owner can invite travellers.");
        }

        String email = inviteeEmail.trim().toLowerCase();

        // Skip duplicate PENDING
        Optional<TripInvitation> existing = invRepo
                .findByTripIdAndInviteeEmailIgnoreCaseAndStatus(tripId, email, TripInvitation.Status.PENDING);
        if (existing.isPresent()) return TripInvitationResponse.fromEntity(existing.get());

        // Skip if already a traveller
        Optional<User> inviteeUser = userRepo.findByEmail(email);
        if (inviteeUser.isPresent()) {
            boolean already = trip.getTravelers().stream()
                    .anyMatch(t -> t.getEmail().equalsIgnoreCase(email));
            if (already) throw new IllegalStateException(email + " is already on this trip.");
        }

        TripInvitation inv = new TripInvitation();
        inv.setTrip(trip);
        inv.setInvitedBy(owner);
        inv.setInviteeEmail(email);
        inv.setInvitee(inviteeUser.orElse(null));
        inv.setStatus(TripInvitation.Status.PENDING);
        invRepo.save(inv);

        // Notify invitee
        notifService.createForEmail(
            email,
            Notification.Type.GROUP_INVITATION,
            "You're invited to join \"" + trip.getTitle() + "\"",
            owner.getFullName() + " invited you to join their trip to " + trip.getDestination() + ".",
            "/trips/" + tripId
        );

        return TripInvitationResponse.fromEntity(inv);
    }

    /* ── Get my pending trip invitations ── */
    @Transactional(readOnly = true)
    public List<TripInvitationResponse> getMyPending(String email) {
        return invRepo.findByInviteeEmailIgnoreCaseAndStatus(email, TripInvitation.Status.PENDING)
                .stream().map(TripInvitationResponse::fromEntity).collect(Collectors.toList());
    }

    /* ── Get all invitations for a trip (history with status) ── */
    @Transactional(readOnly = true)
    public List<TripInvitationResponse> getTripInvitations(String email, Long tripId) {
        Trip trip = findTrip(tripId);
        boolean isOwner = trip.getOwner().getEmail().equalsIgnoreCase(email);
        boolean isTraveler = trip.getTravelers().stream()
                .anyMatch(t -> t.getEmail().equalsIgnoreCase(email));
        if (!isOwner && !isTraveler) {
            throw new AccessDeniedCustomException("Access denied.");
        }
        return invRepo.findByTripIdOrderByCreatedAtDesc(tripId)
                .stream().map(TripInvitationResponse::fromEntity).collect(Collectors.toList());
    }

    /* ── Accept or reject ── */
    public TripInvitationResponse respond(String email, Long invId, boolean accept) {
        TripInvitation inv = invRepo.findById(invId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!inv.getInviteeEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedCustomException("This invitation is not for you.");
        }
        if (inv.getStatus() != TripInvitation.Status.PENDING) {
            throw new IllegalStateException("Invitation already responded to.");
        }

        inv.setStatus(accept ? TripInvitation.Status.ACCEPTED : TripInvitation.Status.REJECTED);
        inv.setRespondedAt(LocalDateTime.now());

        String ownerEmail    = inv.getInvitedBy().getEmail();
        String tripTitle     = inv.getTrip().getTitle();
        String responderName = inv.getInvitee() != null
                ? inv.getInvitee().getFullName() : inv.getInviteeEmail();

        if (accept) {
            User user = findUser(email);
            Trip trip = inv.getTrip();
            boolean notYet = trip.getTravelers().stream()
                    .noneMatch(t -> t.getId().equals(user.getId()));
            if (notYet) {
                trip.getTravelers().add(user);
                tripRepo.save(trip);
            }
            notifService.createForEmail(
                ownerEmail,
                Notification.Type.INVITATION_ACCEPTED,
                responderName + " accepted your trip invitation",
                responderName + " will join you on \"" + tripTitle + "\".",
                "/trips/" + trip.getId()
            );
        } else {
            notifService.createForEmail(
                ownerEmail,
                Notification.Type.INVITATION_REJECTED,
                responderName + " declined your trip invitation",
                responderName + " declined the invitation to join \"" + tripTitle + "\".",
                "/trips"
            );
        }

        invRepo.save(inv);
        return TripInvitationResponse.fromEntity(inv);
    }

    private User findUser(String email) {
        return userRepo.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Trip findTrip(Long id) {
        return tripRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
    }
}
