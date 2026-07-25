package com.tripnest.controller;

import com.tripnest.dto.ChangePasswordRequest;
import com.tripnest.dto.UpdateProfileRequest;
import com.tripnest.dto.UserProfileResponse;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(userService.getProfile(email));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(userService.updateProfile(email, request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changeMyPassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        userService.changePassword(email, request);
        return ResponseEntity.noContent().build();
    }
}
