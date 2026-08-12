package com.tripnest.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discussions")
public class DiscussionEntity {

    @Id
    private String id;

    private String tripId;
    private String senderId;
    private String senderName;
    
    @Column(length = 2000)
    private String message;
    
    private LocalDateTime createdAt;

    public DiscussionEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public DiscussionEntity(String id, String tripId, String senderId, String senderName, String message) {
        this.id = id;
        this.tripId = tripId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
