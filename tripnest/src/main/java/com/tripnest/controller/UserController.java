package com.tripnest.controller;

import com.tripnest.dto.UpdateProfileRequest;
import com.tripnest.dto.UserProfileResponse;
import com.tripnest.entity.User;
import com.tripnest.service.UserService;
import com.tripnest.security.UserDetailsImpl;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;


    // ==========================================
    // GET PROFILE
    // ==========================================

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {

        UserDetailsImpl userDetails =
                getCurrentUser();

        User user =
                userService
                        .getUserById(userDetails.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        return ResponseEntity.ok(
                buildProfileResponse(
                        user,
                        userDetails
                )
        );
    }


    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        UserDetailsImpl userDetails =
                getCurrentUser();

        User user =
                userService
                        .getUserById(userDetails.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        // Update editable fields

        user.setFirstName(
                request.getFirstName()
        );

        user.setLastName(
                request.getLastName()
        );

        user.setPhone(
                request.getPhone()
        );


        // Save changes

        User updatedUser =
                userService.updateUser(user);


        // Return updated profile

        return ResponseEntity.ok(
                buildProfileResponse(
                        updatedUser,
                        userDetails
                )
        );
    }


    // ==========================================
    // BUILD PROFILE RESPONSE
    // ==========================================

    private UserProfileResponse buildProfileResponse(
            User user,
            UserDetailsImpl userDetails) {

        UserProfileResponse response =
                new UserProfileResponse();

        response.setId(
                user.getId()
        );

        response.setUsername(
                user.getUsername()
        );

        response.setEmail(
                user.getEmail()
        );

        response.setFirstName(
                user.getFirstName()
        );

        response.setLastName(
                user.getLastName()
        );

        response.setPhone(
                user.getPhone()
        );

        response.setRoles(
                userDetails
                        .getAuthorities()
                        .stream()
                        .map(item ->
                                item.getAuthority())
                        .collect(
                                Collectors.toList()
                        )
        );

        return response;
    }


    // ==========================================
    // CURRENT USER
    // ==========================================

    private UserDetailsImpl getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (UserDetailsImpl)
                authentication.getPrincipal();
    }
}