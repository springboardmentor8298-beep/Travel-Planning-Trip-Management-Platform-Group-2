package com.tripnest.controller;

import com.tripnest.dto.TripInvitationResponse;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.TripInvitationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
public class TripInvitationController {

    private final TripInvitationService invService;

    public TripInvitationController(TripInvitationService invService) {
        this.invService = invService;
    }

    /** Invite a traveller — returns the new invitation with PENDING status */
    @PostMapping("/{tripId}/invitations")
    public ResponseEntity<TripInvitationResponse> invite(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        if (email.isEmpty()) return ResponseEntity.badRequest().build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invService.invite(principal.getUsername(), tripId, email));
    }

    /** All invitations for a trip (PENDING + ACCEPTED + REJECTED — full history) */
    @GetMapping("/{tripId}/invitations")
    public List<TripInvitationResponse> getTripInvitations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId) {
        return invService.getTripInvitations(principal.getUsername(), tripId);
    }

    /** Pending trip invitations for the current user */
    @GetMapping("/invitations/pending")
    public List<TripInvitationResponse> getMyPending(
            @AuthenticationPrincipal UserPrincipal principal) {
        return invService.getMyPending(principal.getUsername());
    }

    /** Accept or reject a trip invitation */
    @PutMapping("/invitations/{invId}/respond")
    public TripInvitationResponse respond(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long invId,
            @RequestBody Map<String, Boolean> body) {
        boolean accept = Boolean.TRUE.equals(body.get("accept"));
        return invService.respond(principal.getUsername(), invId, accept);
    }
}
