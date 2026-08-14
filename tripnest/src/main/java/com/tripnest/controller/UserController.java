package com.tripnest.controller;

import com.tripnest.dto.ChangePasswordRequest;
import com.tripnest.dto.DestinationResponse;
import com.tripnest.dto.MessageResponse;
import com.tripnest.dto.UserProfileResponse;
import com.tripnest.dto.UserProfileUpdateRequest;
import com.tripnest.security.services.UserDetailsImpl;
import com.tripnest.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getUserProfile(userDetails.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getId(), request));
    }

    @PostMapping("/favorites/{destinationId}")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long destinationId) {
        boolean favorited = userService.toggleFavoriteDestination(userDetails.getId(), destinationId);
        return ResponseEntity.ok(Map.of("destinationId", destinationId, "favorited", favorited));
    }

    @GetMapping("/favorites")
    public ResponseEntity<Set<DestinationResponse>> getFavorites(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getFavoriteDestinations(userDetails.getId()));
    }

    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getId(), request);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
    }
}
