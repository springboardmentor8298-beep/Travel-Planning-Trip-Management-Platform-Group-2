package com.tripnest.controller;

import com.tripnest.dto.TripMemberDTO;
import com.tripnest.service.TripMemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/members")
public class TripMemberController {

    private final TripMemberService tripMemberService;

    public TripMemberController(TripMemberService tripMemberService) {
        this.tripMemberService = tripMemberService;
    }

    @GetMapping
    public ResponseEntity<List<TripMemberDTO>> getTripMembers(@PathVariable("tripId") Integer tripId,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        List<TripMemberDTO> members = tripMemberService.getTripMembers(tripId, userDetails.getUsername());
        return ResponseEntity.ok(members);
    }

    @PostMapping
    public ResponseEntity<TripMemberDTO> addTripMember(@PathVariable("tripId") Integer tripId,
                                                       @RequestBody Map<String, String> payload,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        String email = payload.get("email");
        String role = payload.getOrDefault("role", "MEMBER");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        TripMemberDTO added = tripMemberService.addTripMember(tripId, email.trim(), role, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(added);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> removeTripMember(@PathVariable("tripId") Integer tripId,
                                                    @PathVariable("userId") Integer userId,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        tripMemberService.removeTripMember(tripId, userId, userDetails.getUsername());
        return ResponseEntity.ok("Member removed successfully!");
    }
}
