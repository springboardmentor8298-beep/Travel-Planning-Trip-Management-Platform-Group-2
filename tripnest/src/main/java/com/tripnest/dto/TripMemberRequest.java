package com.tripnest.dto;

import lombok.Data;

@Data
public class TripMemberRequest {
    /** Invite by username or email */
    private String usernameOrEmail;
}
