package com.tripnest.controller;

import com.tripnest.dto.TripMemberRequest;
import com.tripnest.dto.TripMemberResponse;
import com.tripnest.security.UserDetailsImpl;
import com.tripnest.service.TripMemberService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trips")
public class TripMemberController {

    @Autowired
    private TripMemberService tripMemberService;

    // Add member
    @PostMapping("/{tripId}/members")
    public ResponseEntity<?> addMember(
            @PathVariable Long tripId,
            @Valid @RequestBody TripMemberRequest request) {

        UserDetailsImpl userDetails = getCurrentUser();

        TripMemberResponse response =
                tripMemberService.addMember(
                        tripId,
                        request,
                        userDetails.getId()
                );

        return ResponseEntity.ok(response);
    }

    // Get members
    @GetMapping("/{tripId}/members")
    public ResponseEntity<?> getMembers(
            @PathVariable Long tripId) {

        UserDetailsImpl userDetails = getCurrentUser();

        List<TripMemberResponse> members =
                tripMemberService.getMembers(
                        tripId,
                        userDetails.getId()
                );

        return ResponseEntity.ok(members);
    }

    // Remove member
    @DeleteMapping("/{tripId}/members/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long tripId,
            @PathVariable Long userId) {

        UserDetailsImpl userDetails = getCurrentUser();

        tripMemberService.removeMember(
                tripId,
                userId,
                userDetails.getId()
        );

        return ResponseEntity.ok(
                "Member removed successfully"
        );
    }

    private UserDetailsImpl getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (UserDetailsImpl)
                authentication.getPrincipal();
    }
}