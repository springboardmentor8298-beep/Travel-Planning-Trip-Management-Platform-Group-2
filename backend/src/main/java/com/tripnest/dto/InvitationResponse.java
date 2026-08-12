package com.tripnest.dto;

import com.tripnest.model.GroupInvitation;

import java.time.LocalDateTime;

public class InvitationResponse {

    private Long id;
    private Long groupId;
    private String groupName;
    private String inviteeEmail;
    private String inviteeName;    // null if user not registered
    private String invitedByName;
    private String invitedByEmail;
    private String status;         // PENDING | ACCEPTED | REJECTED
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    public static InvitationResponse fromEntity(GroupInvitation inv) {
        InvitationResponse r = new InvitationResponse();
        r.id            = inv.getId();
        r.groupId       = inv.getGroup().getId();
        r.groupName     = inv.getGroup().getName();
        r.inviteeEmail  = inv.getInviteeEmail();
        r.inviteeName   = inv.getInvitee() != null ? inv.getInvitee().getFullName() : null;
        r.invitedByName = inv.getInvitedBy().getFullName();
        r.invitedByEmail= inv.getInvitedBy().getEmail();
        r.status        = inv.getStatus().name();
        r.createdAt     = inv.getCreatedAt();
        r.respondedAt   = inv.getRespondedAt();
        return r;
    }

    public Long getId() { return id; }
    public Long getGroupId() { return groupId; }
    public String getGroupName() { return groupName; }
    public String getInviteeEmail() { return inviteeEmail; }
    public String getInviteeName() { return inviteeName; }
    public String getInvitedByName() { return invitedByName; }
    public String getInvitedByEmail() { return invitedByEmail; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
}
