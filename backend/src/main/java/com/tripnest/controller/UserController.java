package com.tripnest.controller;

import com.tripnest.dto.response.ApiResponse;
import com.tripnest.entity.Role;
import com.tripnest.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Authenticated user profile")
public class UserController {

    @GetMapping("/me")
    @Operation(summary = "Get the currently authenticated user's profile")
    public ApiResponse<Map<String, Object>> me(@AuthenticationPrincipal UserPrincipal principal) {
        var user = principal.getUser();

        Map<String, Object> profile = Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "phoneNumber", user.getPhoneNumber() == null ? "" : user.getPhoneNumber(),
                "profilePictureUrl", user.getProfilePictureUrl() == null ? "" : user.getProfilePictureUrl(),
                "provider", user.getProvider(),
                "roles", user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()),
                "createdAt", user.getCreatedAt()
        );

        return ApiResponse.success(profile);
    }
}
