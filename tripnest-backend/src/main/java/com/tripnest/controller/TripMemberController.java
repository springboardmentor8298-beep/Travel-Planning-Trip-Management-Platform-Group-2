package com.tripnest.controller;

import com.tripnest.dto.TripMemberRequest;
import com.tripnest.dto.TripMemberResponse;
import com.tripnest.entity.TripRole;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.TripMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/members")
@RequiredArgsConstructor
public class TripMemberController {

    private final TripMemberService tripMemberService;

    @PostMapping
    public ResponseEntity<TripMemberResponse> inviteMember(@PathVariable Long tripId,
                                                            @Valid @RequestBody TripMemberRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripMemberService.inviteMember(email, tripId, request));
    }

    @GetMapping
    public ResponseEntity<List<TripMemberResponse>> getMembers(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripMemberService.getMembers(email, tripId));
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<TripMemberResponse> updateRole(@PathVariable Long tripId,
                                                          @PathVariable Long userId,
                                                          @RequestBody Map<String, String> body) {
        String email = SecurityUtils.getCurrentUserEmail();
        TripRole newRole = TripRole.valueOf(body.get("role"));
        return ResponseEntity.ok(tripMemberService.updateMemberRole(email, tripId, userId, newRole));
    }
}
