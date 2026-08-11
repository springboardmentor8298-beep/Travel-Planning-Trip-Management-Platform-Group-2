package com.tripnest.dto;

import com.tripnest.entity.TripInvitation.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripInvitationResponse {
    
    private Long id;
    private Long tripId;
    private String tripTitle;
    private String tripDestination;
    private Long inviterId;
    private String inviterName;
    private Long inviteeId;
    private String inviteeName;
    private InvitationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private String message;
}
