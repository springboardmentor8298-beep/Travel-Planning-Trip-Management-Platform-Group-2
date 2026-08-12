package com.tripnest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_user_read", columnList = "user_id, is_read"),
    @Index(name = "idx_notif_created",   columnList = "created_at DESC")
})
public class Notification {

    public enum Type {
        GROUP_INVITATION,       // You were invited to a group
        INVITATION_ACCEPTED,    // Someone accepted YOUR invitation
        INVITATION_REJECTED,    // Someone declined YOUR invitation
        GROUP_MEMBER_JOINED,    // A new member joined your group
        TRIP_REMINDER,
        ACTIVITY_REMINDER,
        BUDGET_ALERT,
        TRAVEL_UPDATE,
        SYSTEM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user this notification belongs to */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Type type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String message;

    /** Optional deep-link reference (e.g. /groups/5) */
    @Column(length = 300)
    private String actionUrl;

    /** Extra payload — e.g. groupId, invitationId */
    @Column(length = 300)
    private String metadata;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Notification() {}

    /* Convenience constructor */
    public Notification(User user, Type type, String title, String message, String actionUrl) {
        this.user      = user;
        this.type      = type;
        this.title     = title;
        this.message   = message;
        this.actionUrl = actionUrl;
    }

    // Getters & setters
    public Long getId()                      { return id; }
    public void setId(Long id)               { this.id = id; }
    public User getUser()                    { return user; }
    public void setUser(User user)           { this.user = user; }
    public Type getType()                    { return type; }
    public void setType(Type type)           { this.type = type; }
    public String getTitle()                 { return title; }
    public void setTitle(String title)       { this.title = title; }
    public String getMessage()               { return message; }
    public void setMessage(String message)   { this.message = message; }
    public String getActionUrl()             { return actionUrl; }
    public void setActionUrl(String u)       { this.actionUrl = u; }
    public String getMetadata()              { return metadata; }
    public void setMetadata(String m)        { this.metadata = m; }
    public boolean isRead()                  { return isRead; }
    public void setRead(boolean read)        { this.isRead = read; }
    public LocalDateTime getCreatedAt()      { return createdAt; }
    public void setCreatedAt(LocalDateTime t){ this.createdAt = t; }
}
