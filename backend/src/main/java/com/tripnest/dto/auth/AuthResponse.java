package com.tripnest.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UserSummary user;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String fullName;
        private String email;
        private String profilePictureUrl;
    }
}
