package com.tripnest.controller;

import com.tripnest.dto.TripMemberRequest;
import com.tripnest.dto.TripMemberResponse;
import com.tripnest.security.services.UserDetailsImpl;
import com.tripnest.service.CollaborationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for trip member collaboration.
 *
 * Routes:
 *   GET    /api/trips/{tripId}/members              — list members
 *   POST   /api/trips/{tripId}/members/invite       — invite member
 *   PUT    /api/trips/{tripId}/members/{id}/accept  — accept invite
 *   PUT    /api/trips/{tripId}/members/{id}/decline — decline invite
 *   DELETE /api/trips/{tripId}/members/{id}         — remove member
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trips/{tripId}/members")
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationService collaborationService;

    @GetMapping
    public ResponseEntity<List<TripMemberResponse>> getMembers(@PathVariable Long tripId) {
        return ResponseEntity.ok(collaborationService.getMembers(tripId));
    }

    @PostMapping("/invite")
    public ResponseEntity<TripMemberResponse> inviteMember(
            @PathVariable Long tripId,
            @RequestBody TripMemberRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(collaborationService.inviteMember(tripId, currentUser.getId(), request));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<TripMemberResponse> acceptInvite(
            @PathVariable Long tripId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(collaborationService.acceptInvite(tripId, id, currentUser.getId()));
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<TripMemberResponse> declineInvite(
            @PathVariable Long tripId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(collaborationService.declineInvite(tripId, id, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long tripId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        collaborationService.removeMember(tripId, id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
