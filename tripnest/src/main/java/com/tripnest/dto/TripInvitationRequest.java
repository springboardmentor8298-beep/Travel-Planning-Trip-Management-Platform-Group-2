package com.tripnest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripInvitationRequest {
    
    /** Invite by user ID (legacy). Either this or inviteeUsername must be provided. */
    private Long inviteeId;

    /** Invite by username (preferred). Either this or inviteeId must be provided. */
    private String inviteeUsername;
    
    private String message;
}
