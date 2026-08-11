package com.tripnest.dto;

import java.time.LocalDate;

public class TripRequest {
    private String name;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String photoUrl;
    private String status;
    private Long destinationId;

    public String getName() {
        if (name != null) return name;
        return title;
    }
    public void setName(String name) { this.name = name; }
    public String getTitle() {
        if (title != null) return title;
        return name;
    }
    public void setTitle(String title) { this.title = title; }
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
}
