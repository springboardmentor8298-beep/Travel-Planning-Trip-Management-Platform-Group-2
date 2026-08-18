package com.tripnest.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TripMemberResponse {

    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private LocalDateTime joinedAt;

    public TripMemberResponse(
            Long id,
            Long userId,
            String username,
            String email,
            String firstName,
            String lastName,
            String role,
            LocalDateTime joinedAt
    ) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.joinedAt = joinedAt;
    }
}