package com.tripnest.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class NotificationEntity {

    @Id
    private String id;

    private String userId;
    
    @Column(length = 1000)
    private String message;
    
    private String type; // TRIP_REMINDER, ACTIVITY_REMINDER, BUDGET_ALERT, GROUP_INVITATION, SYSTEM
    private String tripId;
    private String status; // PENDING, ACCEPTED, DECLINED

    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationEntity() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
        this.status = "PENDING";
    }

    public NotificationEntity(String id, String userId, String message, String type) {
        this.id = id;
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.isRead = false;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public NotificationEntity(String id, String userId, String message, String type, String tripId) {
        this.id = id;
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.tripId = tripId;
        this.status = "PENDING";
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
