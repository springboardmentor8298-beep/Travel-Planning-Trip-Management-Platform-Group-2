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
    private Double lat;
    private Double lng;

    public static ItineraryItemResponse fromEntity(ItineraryItem item) {
        ItineraryItemResponse r = new ItineraryItemResponse();
        r.id           = item.getId();
        r.title        = item.getTitle();
        r.activityDate = item.getActivityDate();
        r.startTime    = item.getStartTime();
        r.endTime      = item.getEndTime();
        r.activityType = item.getActivityType();
        r.location     = item.getLocation();
        r.placeAddress = item.getPlaceAddress();
        r.reminderAt   = item.getReminderAt();
        r.notes        = item.getNotes();
        r.lat          = item.getLat();
        r.lng          = item.getLng();
        return r;
    }

    public Long getId()                         { return id; }
    public String getTitle()                    { return title; }
    public LocalDate getActivityDate()          { return activityDate; }
    public LocalTime getStartTime()             { return startTime; }
    public LocalTime getEndTime()               { return endTime; }
    public ActivityType getActivityType()       { return activityType; }
    public String getLocation()                 { return location; }
    public String getPlaceAddress()             { return placeAddress; }
    public LocalDateTime getReminderAt()        { return reminderAt; }
    public String getNotes()                    { return notes; }
    public Double getLat()                      { return lat; }
    public Double getLng()                      { return lng; }
}
