package com.tripnest.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
public class ActivityEntity {

    @Id
    private String id;

    private String tripId;
    private int dayNumber;
    private String title;
    private String description;
    private String category; // Sightseeing, Transportation, Accommodation, Dining, Adventure, Shopping
    private String placeName;
    private String placeAddress;
    private Double latitude;
    private Double longitude;
    private Double cost;
    private String startTime;
    private String endTime;
    private LocalDateTime createdAt;

    public ActivityEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public ActivityEntity(String id, String tripId, int dayNumber, String title, String description, String category, String placeName, String placeAddress, Double latitude, Double longitude, Double cost, String startTime, String endTime) {
        this.id = id;
        this.tripId = tripId;
        this.dayNumber = dayNumber;
        this.title = title;
        this.description = description;
        this.category = category;
        this.placeName = placeName;
        this.placeAddress = placeAddress;
        this.latitude = latitude;
        this.longitude = longitude;
        this.cost = cost;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public int getDayNumber() { return dayNumber; }
    public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPlaceName() { return placeName; }
    public void setPlaceName(String placeName) { this.placeName = placeName; }

    public String getPlaceAddress() { return placeAddress; }
    public void setPlaceAddress(String placeAddress) { this.placeAddress = placeAddress; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
