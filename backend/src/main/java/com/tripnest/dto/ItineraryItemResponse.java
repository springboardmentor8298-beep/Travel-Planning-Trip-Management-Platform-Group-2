package com.tripnest.dto;

import com.tripnest.model.ActivityType;
import com.tripnest.model.ItineraryItem;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ItineraryItemResponse {
    private Long id;
    private String title;
    private LocalDate activityDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ActivityType activityType;
    private String location;
    private String placeAddress;
    private LocalDateTime reminderAt;
    private String notes;

    public ItineraryItemResponse() {
    }

    public ItineraryItemResponse(Long id, String title, LocalDate activityDate, LocalTime startTime,
                                 LocalTime endTime, ActivityType activityType, String location,
                                 String placeAddress, LocalDateTime reminderAt, String notes) {
        this.id = id;
        this.title = title;
        this.activityDate = activityDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.activityType = activityType;
        this.location = location;
        this.placeAddress = placeAddress;
        this.reminderAt = reminderAt;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public ActivityType getActivityType() {
        return activityType;
    }

    public String getLocation() {
        return location;
    }

    public String getPlaceAddress() {
        return placeAddress;
    }

    public LocalDateTime getReminderAt() {
        return reminderAt;
    }

    public String getNotes() {
        return notes;
    }

    public static ItineraryItemResponse fromEntity(ItineraryItem item) {
        return new ItineraryItemResponse(
                item.getId(),
                item.getTitle(),
                item.getActivityDate(),
                item.getStartTime(),
                item.getEndTime(),
                item.getActivityType(),
                item.getLocation(),
                item.getPlaceAddress(),
                item.getReminderAt(),
                item.getNotes()
        );
    }
}
