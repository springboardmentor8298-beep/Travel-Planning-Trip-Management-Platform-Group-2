package com.tripnest.backend.controller;

import com.tripnest.backend.model.DiscussionEntity;
import com.tripnest.backend.model.TripEntity;
import com.tripnest.backend.model.UserEntity;
import com.tripnest.backend.repository.DiscussionRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/trips/{tripId}")
@CrossOrigin(origins = "*")
public class CollaborationController {

    @Autowired
    private DiscussionRepository discussionRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping({"/discussions", "/group/discussions"})
    public ResponseEntity<List<DiscussionEntity>> getDiscussions(@PathVariable String tripId) {
        return ResponseEntity.ok(discussionRepository.findByTripIdOrderByCreatedAtAsc(tripId));
    }

    @PostMapping({"/discussions", "/group/discussions"})
    public ResponseEntity<?> addDiscussion(@PathVariable String tripId, @RequestBody Map<String, String> body) {
        DiscussionEntity disc = new DiscussionEntity();
        disc.setId("disc_" + UUID.randomUUID().toString().substring(0, 8));
        disc.setTripId(tripId);
        disc.setSenderId(body.getOrDefault("senderId", "user_101"));
        disc.setSenderName(body.getOrDefault("senderName", "Traveler"));
        disc.setMessage(body.getOrDefault("message", ""));

        DiscussionEntity saved = discussionRepository.save(disc);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/group/members")
    public ResponseEntity<List<Map<String, String>>> getMembers(@PathVariable String tripId) {
        Optional<TripEntity> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        TripEntity trip = tripOpt.get();
        List<Map<String, String>> members = new ArrayList<>();
        Set<String> seenKeys = new HashSet<>();

        // Add Trip Owner
        String ownerEmail = trip.getOwnerEmail();
        if (ownerEmail != null && !ownerEmail.isBlank()) {
            String cleanEmail = ownerEmail.trim().toLowerCase();
            Optional<UserEntity> ownerUserOpt = userRepository.findByEmail(cleanEmail);
            
            String displayName = ownerEmail.contains("@") ? ownerEmail.split("@")[0] : ownerEmail;
            if (ownerUserOpt.isPresent() && ownerUserOpt.get().getName() != null && !ownerUserOpt.get().getName().isBlank()) {
                displayName = ownerUserOpt.get().getName();
            }

            seenKeys.add(cleanEmail);
            if (cleanEmail.contains("@")) {
                seenKeys.add(cleanEmail.split("@")[0]);
            }
            seenKeys.add(displayName.trim().toLowerCase());

            members.add(Map.of(
                    "id", "m_owner",
                    "username", ownerEmail,
                    "fullName", displayName,
                    "roleInTrip", "Trip Organizer"
            ));
        }

        // Add Shared Members (Deduplicated)
        String shared = trip.getSharedMembers();
        if (shared != null && !shared.isBlank()) {
            String[] parts = shared.split(",");
            for (int i = 0; i < parts.length; i++) {
                String rawMember = parts[i].trim();
                if (rawMember.isBlank()) continue;

                String cleanMember = rawMember.toLowerCase();
                String prefix = cleanMember.contains("@") ? cleanMember.split("@")[0] : cleanMember;

                Optional<UserEntity> memberUserOpt = userRepository.findByEmail(cleanMember);
                String displayName = cleanMember.contains("@") ? cleanMember.split("@")[0] : rawMember;
                if (memberUserOpt.isPresent() && memberUserOpt.get().getName() != null && !memberUserOpt.get().getName().isBlank()) {
                    displayName = memberUserOpt.get().getName();
                }

                String cleanName = displayName.trim().toLowerCase();

                // Skip if this member is the owner or already added
                if (seenKeys.contains(cleanMember) || seenKeys.contains(prefix) || seenKeys.contains(cleanName)) {
                    continue;
                }

                seenKeys.add(cleanMember);
                seenKeys.add(prefix);
                seenKeys.add(cleanName);

                members.add(Map.of(
                        "id", "m_" + i,
                        "username", rawMember,
                        "fullName", displayName,
                        "roleInTrip", "Co-Traveler"
                ));
            }
        }

        // Sync trip member count in database if out of sync
        if (trip.getMemberCount() == null || trip.getMemberCount() != members.size()) {
            trip.setMemberCount(members.size());
            tripRepository.save(trip);
        }

        return ResponseEntity.ok(members);
    }
}
