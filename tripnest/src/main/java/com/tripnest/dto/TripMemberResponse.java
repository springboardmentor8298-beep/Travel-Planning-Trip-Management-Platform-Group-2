package com.tripnest.dto;

import com.tripnest.entity.MemberRole;
import com.tripnest.entity.MemberStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TripMemberResponse {
    private Long id;
    private Long tripId;
    private Long userId;
    private String username;
    private String email;
    private MemberRole role;
    private MemberStatus status;
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;
}
