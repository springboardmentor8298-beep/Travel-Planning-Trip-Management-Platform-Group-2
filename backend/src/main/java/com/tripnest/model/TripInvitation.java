package com.tripnest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_invitations")
public class TripInvitation {

    public enum Status { PENDING, ACCEPTED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitee_id")
    private User invitee;

    @Column(nullable = false, length = 150)
    private String inviteeEmail;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invited_by_id", nullable = false)
    private User invitedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime respondedAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public TripInvitation() {}

    public Long getId()                             { return id; }
    public Trip getTrip()                           { return trip; }
    public void setTrip(Trip trip)                  { this.trip = trip; }
    public User getInvitee()                        { return invitee; }
    public void setInvitee(User u)                  { this.invitee = u; }
    public String getInviteeEmail()                 { return inviteeEmail; }
    public void setInviteeEmail(String e)           { this.inviteeEmail = e; }
    public User getInvitedBy()                      { return invitedBy; }
    public void setInvitedBy(User u)                { this.invitedBy = u; }
    public Status getStatus()                       { return status; }
    public void setStatus(Status s)                 { this.status = s; }
    public LocalDateTime getCreatedAt()             { return createdAt; }
    public LocalDateTime getRespondedAt()           { return respondedAt; }
    public void setRespondedAt(LocalDateTime t)     { this.respondedAt = t; }
}
