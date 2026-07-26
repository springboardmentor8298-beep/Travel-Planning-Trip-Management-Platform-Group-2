package com.tripnest.controller;

import com.tripnest.dto.TravelGroupRequest;
import com.tripnest.dto.TravelGroupResponse;
import com.tripnest.entity.GroupRole;
import com.tripnest.service.TravelGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TravelGroupController {

    private final TravelGroupService travelGroupService;

    @PostMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<TravelGroupResponse> createGroup(
            Authentication authentication,
            @Valid @RequestBody TravelGroupRequest request) {
        Long userId = Long.parseLong(authentication.getName());
        TravelGroupResponse group = travelGroupService.createGroup(userId, request);
        return ResponseEntity.ok(group);
    }

    @PutMapping("/{groupId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<TravelGroupResponse> updateGroup(
            @PathVariable Long groupId,
            @Valid @RequestBody TravelGroupRequest request) {
        TravelGroupResponse group = travelGroupService.updateGroup(groupId, request);
        return ResponseEntity.ok(group);
    }

    @DeleteMapping("/{groupId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId) {
        travelGroupService.deleteGroup(groupId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{groupId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<TravelGroupResponse> getGroup(@PathVariable Long groupId) {
        TravelGroupResponse group = travelGroupService.getGroup(groupId);
        return ResponseEntity.ok(group);
    }

    @GetMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<TravelGroupResponse>> getUserGroups(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<TravelGroupResponse> groups = travelGroupService.getUserGroups(userId);
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> addMemberToGroup(
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        travelGroupService.addMemberToGroup(groupId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> removeMemberFromGroup(
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        travelGroupService.removeMemberFromGroup(groupId, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{groupId}/members/{userId}/role")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> updateMemberRole(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            @RequestParam GroupRole role) {
        travelGroupService.updateMemberRole(groupId, userId, role);
        return ResponseEntity.ok().build();
    }
}
