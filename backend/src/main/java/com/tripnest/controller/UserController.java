package com.tripnest.controller;

import com.tripnest.dto.UpdateProfileRequest;
import com.tripnest.dto.UserProfileResponse;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserProfileResponse getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getProfile(principal.getUsername());
    }

    @PutMapping("/me")
    public UserProfileResponse updateMyProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(principal.getUsername(), request);
    }

    // Allow any authenticated user to list users
    @GetMapping
    public List<UserProfileResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/count")
    public long countUsers() {
        return userService.countUsers();
    }
}
