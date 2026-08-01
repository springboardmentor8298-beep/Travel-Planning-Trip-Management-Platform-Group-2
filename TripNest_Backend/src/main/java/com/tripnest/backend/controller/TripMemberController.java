package com.tripnest.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.InviteMemberRequest;
import com.tripnest.backend.dto.response.TripMemberResponse;
import com.tripnest.backend.service.TripMemberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripMemberController {

    private final TripMemberService tripMemberService;

    @PostMapping("/{tripId}/members/invite")
    public ResponseEntity<ApiResponse<TripMemberResponse>> inviteMember(
            @PathVariable Long tripId,
            @Valid @RequestBody InviteMemberRequest request) {
        return ResponseEntity.ok(tripMemberService.inviteMember(tripId, request));
    }

    @DeleteMapping("/{tripId}/members/{memberId}")
    public ResponseEntity<ApiResponse<String>> removeMember(
            @PathVariable Long tripId,
            @PathVariable Long memberId) {
        return ResponseEntity.ok(tripMemberService.removeMember(tripId, memberId));
    }

    @GetMapping("/{tripId}/members")
    public ResponseEntity<ApiResponse<List<TripMemberResponse>>> getMembers(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(tripMemberService.getMembers(tripId));
    }

    @PostMapping("/members/{memberId}/accept")
    public ResponseEntity<ApiResponse<String>> acceptInvitation(
            @PathVariable Long memberId) {
        return ResponseEntity.ok(tripMemberService.acceptInvitation(memberId));
    }

    @PostMapping("/members/{memberId}/decline")
    public ResponseEntity<ApiResponse<String>> declineInvitation(
            @PathVariable Long memberId) {
        return ResponseEntity.ok(tripMemberService.declineInvitation(memberId));
    }

    @GetMapping("/members/pending")
    public ResponseEntity<ApiResponse<List<TripMemberResponse>>> getMyPendingInvitations() {
        return ResponseEntity.ok(tripMemberService.getMyPendingInvitations());
    }
}
