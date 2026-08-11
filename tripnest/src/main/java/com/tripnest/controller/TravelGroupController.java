package com.tripnest.controller;

import com.tripnest.dto.TravelGroupRequest;
import com.tripnest.dto.TravelGroupResponse;
import com.tripnest.entity.GroupRole;
import com.tripnest.entity.User;
import com.tripnest.repository.UserRepository;
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
    private final UserRepository userRepository;

    private User resolveUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    @PostMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> createGroup(
            Authentication authentication,
            @Valid @RequestBody TravelGroupRequest request) {
        try {
            User user = resolveUser(authentication);
            TravelGroupResponse group = travelGroupService.createGroup(user.getId(), request);
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            System.err.println("Error in createGroup: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to create group: " + e.getMessage());
        }
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
        try {
            User user = resolveUser(authentication);
            List<TravelGroupResponse> groups = travelGroupService.getUserGroups(user.getId());
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            System.err.println("Error in getUserGroups: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    /** Add member by numeric user ID (legacy). */
    @PostMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> addMemberToGroup(
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        try {
            travelGroupService.addMemberToGroup(groupId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Add member by username (preferred). POST /api/groups/{groupId}/members/by-username?username=bob */
    @PostMapping("/{groupId}/members/by-username")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> addMemberByUsername(
            @PathVariable Long groupId,
            @RequestParam String username) {
        try {
            travelGroupService.addMemberToGroupByUsername(groupId, username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
