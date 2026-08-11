package com.tripnest.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TripResponse {
    private Long id;
    private String name;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String photoUrl;
    private String status;
    private Long destinationId;
    private String destinationName;
    private String destinationLocation;
    private String destinationPhotoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; this.title = name; }
    public String getTitle() { return title != null ? title : name; }
    public void setTitle(String title) { this.title = title; this.name = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getDestinationId() { return destinationId; }
    public void setDestinationId(Long destinationId) { this.destinationId = destinationId; }
    public String getDestinationName() { return destinationName; }
    public void setDestinationName(String destinationName) { this.destinationName = destinationName; }
    public String getDestinationLocation() { return destinationLocation; }
    public void setDestinationLocation(String destinationLocation) { this.destinationLocation = destinationLocation; }
    public String getDestinationPhotoUrl() { return destinationPhotoUrl; }
    public void setDestinationPhotoUrl(String destinationPhotoUrl) { this.destinationPhotoUrl = destinationPhotoUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
