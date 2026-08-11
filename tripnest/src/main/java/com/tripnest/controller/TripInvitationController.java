package com.tripnest.controller;

import com.tripnest.dto.TripInvitationRequest;
import com.tripnest.dto.TripInvitationResponse;
import com.tripnest.service.TripInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/invitations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TripInvitationController {

    private final TripInvitationService invitationService;

    /**
     * Send an invitation. Supports both inviteeId (legacy) and inviteeUsername (preferred).
     * POST /api/trips/{tripId}/invitations
     * Body: { "inviteeUsername": "bob", "message": "Join us!" }
     */
    @PostMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> sendInvitation(
            @PathVariable Long tripId,
            Authentication authentication,
            @Valid @RequestBody TripInvitationRequest request) {
        try {
            String inviterUsername = authentication.getName();
            TripInvitationResponse response = invitationService.sendInvitation(tripId, inviterUsername, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<TripInvitationResponse>> getTripInvitations(
            @PathVariable Long tripId) {
        List<TripInvitationResponse> invitations = invitationService.getTripInvitations(tripId);
        return ResponseEntity.ok(invitations);
    }

    @PostMapping("/{invitationId}/respond")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> respondToInvitation(
            @PathVariable Long tripId,
            @PathVariable Long invitationId,
            Authentication authentication,
            @RequestParam boolean accepted) {
        try {
            String username = authentication.getName();
            TripInvitationResponse response = invitationService.respondToInvitation(invitationId, username, accepted);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{invitationId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelInvitation(
            @PathVariable Long tripId,
            @PathVariable Long invitationId,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            invitationService.cancelInvitation(invitationId, username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
class UserInvitationController {

    private final TripInvitationService invitationService;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<TripInvitationResponse>> getPendingInvitations(
            Authentication authentication) {
        String username = authentication.getName();
        List<TripInvitationResponse> invitations = invitationService.getPendingInvitations(username);
        return ResponseEntity.ok(invitations);
    }

    @GetMapping("/sent")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<TripInvitationResponse>> getSentInvitations(
            Authentication authentication) {
        String username = authentication.getName();
        List<TripInvitationResponse> invitations = invitationService.getSentInvitations(username);
        return ResponseEntity.ok(invitations);
    }
}
