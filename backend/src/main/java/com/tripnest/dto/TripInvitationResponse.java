package com.tripnest.dto;

import com.tripnest.model.TripInvitation;
import java.time.LocalDateTime;

public class TripInvitationResponse {

    private Long id;
    private Long tripId;
    private String tripTitle;
    private String inviteeEmail;
    private String inviteeName;
    private String invitedByName;
    private String invitedByEmail;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    public static TripInvitationResponse fromEntity(TripInvitation inv) {
        TripInvitationResponse r = new TripInvitationResponse();
        r.id             = inv.getId();
        r.tripId         = inv.getTrip().getId();
        r.tripTitle      = inv.getTrip().getTitle();
        r.inviteeEmail   = inv.getInviteeEmail();
        r.inviteeName    = inv.getInvitee() != null ? inv.getInvitee().getFullName() : null;
        r.invitedByName  = inv.getInvitedBy().getFullName();
        r.invitedByEmail = inv.getInvitedBy().getEmail();
        r.status         = inv.getStatus().name();
        r.createdAt      = inv.getCreatedAt();
        r.respondedAt    = inv.getRespondedAt();
        return r;
    }

    public Long getId()                  { return id; }
    public Long getTripId()              { return tripId; }
    public String getTripTitle()         { return tripTitle; }
    public String getInviteeEmail()      { return inviteeEmail; }
    public String getInviteeName()       { return inviteeName; }
    public String getInvitedByName()     { return invitedByName; }
    public String getInvitedByEmail()    { return invitedByEmail; }
    public String getStatus()            { return status; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getRespondedAt(){ return respondedAt; }
}
