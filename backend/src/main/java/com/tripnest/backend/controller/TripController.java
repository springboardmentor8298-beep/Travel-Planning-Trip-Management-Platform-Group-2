package com.tripnest.backend.controller;

import com.tripnest.backend.model.NotificationEntity;
import com.tripnest.backend.model.TripEntity;
import com.tripnest.backend.model.UserEntity;
import com.tripnest.backend.repository.NotificationRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    private final TripService tripService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            return auth.getName();
        }
        return "thiruppathip.srgm@gmail.com";
    }

    @GetMapping
    public ResponseEntity<List<TripEntity>> getTrips(@RequestParam(required = false) String ownerEmail) {
        String email = ownerEmail;
        if (email == null || email.isBlank() || email.equals("null")) {
            email = getCurrentUserEmail();
        }
        List<TripEntity> trips = tripService.getTripsForUser(email);
        for (TripEntity t : trips) {
            if (t.getStatus() == null || t.getStatus().isBlank()) {
                t.setStatus("PLANNED");
            }
        }
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTripById(@PathVariable String id) {
        Optional<TripEntity> tripOpt = tripService.getAllTrips().stream().filter(t -> t.getId().equals(id)).findFirst();
        if (tripOpt.isPresent()) {
            TripEntity trip = tripOpt.get();
            if (trip.getStatus() == null || trip.getStatus().isBlank()) {
                trip.setStatus("PLANNED");
            }
            return ResponseEntity.ok(trip);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody TripEntity trip) {
        if (trip.getTotalBudget() == null || trip.getTotalBudget() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Target budget is required to create a trip!"));
        }

        if (trip.getId() == null || trip.getId().isBlank()) {
            trip.setId("trip_" + UUID.randomUUID().toString().substring(0, 8));
        }

        if (trip.getOwnerEmail() == null || trip.getOwnerEmail().isBlank()) {
            trip.setOwnerEmail(getCurrentUserEmail());
        }

        if (trip.getCoverImageUrl() == null || trip.getCoverImageUrl().isBlank()) {
            trip.setCoverImageUrl("https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80");
        }

        if (trip.getMemberCount() == null || trip.getMemberCount() < 1) {
            trip.setMemberCount(1);
        }

        if (trip.getStatus() == null || trip.getStatus().isBlank()) {
            trip.setStatus("PLANNED");
        }

        return ResponseEntity.ok(tripService.createOrUpdateTrip(trip));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable String id, @RequestBody TripEntity trip) {
        if (trip.getTotalBudget() == null || trip.getTotalBudget() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Target budget is required!"));
        }

        trip.setId(id);
        if (trip.getStatus() == null || trip.getStatus().isBlank()) {
            trip.setStatus("PLANNED");
        }
        return ResponseEntity.ok(tripService.createOrUpdateTrip(trip));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrip(@PathVariable String id) {
        tripService.deleteTrip(id);
        return ResponseEntity.ok(Map.of("message", "Trip deleted successfully"));
    }

    @PostMapping("/{tripId}/invite")
    public ResponseEntity<?> inviteMember(@PathVariable String tripId, @RequestBody Map<String, String> body) {
        String inviteeInput = body.getOrDefault("email", body.get("usernameOrEmail"));
        if (inviteeInput == null || inviteeInput.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email or username is required"));
        }

        String targetEmail = inviteeInput.trim();
        Optional<UserEntity> uOpt = userRepository.findByEmail(targetEmail.toLowerCase());
        if (uOpt.isEmpty()) {
            uOpt = userRepository.findByName(targetEmail);
        }

        if (uOpt.isPresent()) {
            targetEmail = uOpt.get().getEmail();
        }

        Optional<TripEntity> tripOpt = tripService.getAllTrips().stream().filter(t -> t.getId().equals(tripId)).findFirst();
        if (tripOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Trip not found"));
        }

        TripEntity trip = tripOpt.get();

        // Create Invitation Notification for Invitee
        NotificationEntity notif = new NotificationEntity();
        notif.setId("notif_inv_" + UUID.randomUUID().toString().substring(0, 8));
        notif.setUserId(targetEmail);
        notif.setTripId(tripId);
        notif.setType("GROUP_INVITATION");
        notif.setStatus("PENDING");
        notif.setMessage("You have been invited by " + getCurrentUserEmail() + " to collaborate on the trip '" + trip.getTitle() + "' (" + trip.getDestination() + ")!");

        notificationRepository.save(notif);

        return ResponseEntity.ok(Map.of("message", "Invitation successfully sent to " + targetEmail));
    }

    @PostMapping("/invitations/{notifId}/accept")
    public ResponseEntity<?> acceptInvitation(@PathVariable String notifId) {
        Optional<NotificationEntity> notifOpt = notificationRepository.findById(notifId);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invitation notification not found"));
        }

        NotificationEntity notif = notifOpt.get();
        notif.setStatus("ACCEPTED");
        notif.setRead(true);
        notificationRepository.save(notif);

        if (notif.getTripId() != null) {
            Optional<TripEntity> tripOpt = tripService.getAllTrips().stream().filter(t -> t.getId().equals(notif.getTripId())).findFirst();
            if (tripOpt.isPresent()) {
                TripEntity trip = tripOpt.get();
                String existing = trip.getSharedMembers() != null ? trip.getSharedMembers() : "";
                String rawEmail = notif.getUserId() != null ? notif.getUserId().trim() : "";

                if (userRepository != null) {
                    Optional<UserEntity> uOpt = userRepository.findByEmail(rawEmail.toLowerCase());
                    if (uOpt.isEmpty()) uOpt = userRepository.findByName(rawEmail);
                    if (uOpt.isPresent() && uOpt.get().getEmail() != null) {
                        rawEmail = uOpt.get().getEmail().trim();
                    }
                }

                final String targetEmail = rawEmail;

                // Append target email uniquely (if not owner and not already in shared list)
                if (!targetEmail.equalsIgnoreCase(trip.getOwnerEmail())) {
                    List<String> currentList = Arrays.stream(existing.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isBlank())
                            .collect(Collectors.toList());

                    if (currentList.stream().noneMatch(s -> s.equalsIgnoreCase(targetEmail))) {
                        currentList.add(targetEmail);
                        trip.setSharedMembers(String.join(", ", currentList));
                        trip.setMemberCount(1 + currentList.size());
                        tripService.createOrUpdateTrip(trip);
                    }
                }

                // Notify Trip Owner
                NotificationEntity ownerNotif = new NotificationEntity(
                        "notif_acc_" + UUID.randomUUID().toString().substring(0, 8),
                        trip.getOwnerEmail() != null ? trip.getOwnerEmail() : "organizer",
                        targetEmail + " accepted your invitation to join '" + trip.getTitle() + "'! Collaboration unlocked.",
                        "SYSTEM"
                );
                notificationRepository.save(ownerNotif);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Invitation accepted successfully! You can now collaborate on this trip."));
    }

    @PostMapping("/invitations/{notifId}/decline")
    public ResponseEntity<?> declineInvitation(@PathVariable String notifId) {
        Optional<NotificationEntity> notifOpt = notificationRepository.findById(notifId);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invitation notification not found"));
        }

        NotificationEntity notif = notifOpt.get();
        notif.setStatus("DECLINED");
        notif.setRead(true);
        notificationRepository.save(notif);

        if (notif.getTripId() != null) {
            Optional<TripEntity> tripOpt = tripService.getAllTrips().stream().filter(t -> t.getId().equals(notif.getTripId())).findFirst();
            if (tripOpt.isPresent()) {
                TripEntity trip = tripOpt.get();
                NotificationEntity ownerNotif = new NotificationEntity(
                        "notif_dec_" + UUID.randomUUID().toString().substring(0, 8),
                        trip.getOwnerEmail() != null ? trip.getOwnerEmail() : "organizer",
                        notif.getUserId() + " declined your invitation to join '" + trip.getTitle() + "'.",
                        "SYSTEM"
                );
                notificationRepository.save(ownerNotif);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Invitation declined."));
    }
}
