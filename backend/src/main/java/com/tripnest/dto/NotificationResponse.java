package com.tripnest.dto;

import com.tripnest.model.Notification;
import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String type;      // enum name e.g. "GROUP_INVITATION"
    private String title;
    private String message;
    private String actionUrl;
    private String metadata;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponse fromEntity(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.id        = n.getId();
        r.type      = n.getType().name();
        r.title     = n.getTitle();
        r.message   = n.getMessage();
        r.actionUrl = n.getActionUrl();
        r.metadata  = n.getMetadata();
        r.isRead    = n.isRead();
        r.createdAt = n.getCreatedAt();
        return r;
    }

    public Long getId()                { return id; }
    public String getType()            { return type; }
    public String getTitle()           { return title; }
    public String getMessage()         { return message; }
    public String getActionUrl()       { return actionUrl; }
    public String getMetadata()        { return metadata; }
    public boolean isRead()            { return isRead; }
    public LocalDateTime getCreatedAt(){ return createdAt; }
}
