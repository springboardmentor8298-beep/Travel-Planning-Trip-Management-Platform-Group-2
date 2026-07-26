package com.tripnest.dto;

import com.tripnest.entity.ActivityType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * DTO returned when reading an Activity.
 */
@Data
public class ActivityResponse {

    private Long id;
    private String name;
    private String description;
    private ActivityType activityType;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private BigDecimal cost;
    private Long itineraryId;
    private Double latitude;
    private Double longitude;
}
