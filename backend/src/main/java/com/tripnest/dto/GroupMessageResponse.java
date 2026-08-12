package com.tripnest.dto;

import com.tripnest.model.GroupMessage;

import java.time.LocalDateTime;

public class GroupMessageResponse {

    private Long id;
    private Long groupId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String content;
    private LocalDateTime createdAt;

    public static GroupMessageResponse fromEntity(GroupMessage m) {
        GroupMessageResponse r = new GroupMessageResponse();
        r.id          = m.getId();
        r.groupId     = m.getGroup().getId();
        r.senderId    = m.getSender().getId();
        r.senderName  = m.getSender().getFullName();
        r.senderEmail = m.getSender().getEmail();
        r.content     = m.getContent();
        r.createdAt   = m.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public Long getGroupId() { return groupId; }
    public Long getSenderId() { return senderId; }
    public String getSenderName() { return senderName; }
    public String getSenderEmail() { return senderEmail; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
