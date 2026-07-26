package com.tripnest.dto;

import com.tripnest.entity.ActivityType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * DTO for creating or updating an Activity.
 */
@Data
public class ActivityRequest {

    @NotBlank
    private String name;

    private String description;

    private ActivityType activityType = ActivityType.SIGHTSEEING;

    private LocalTime startTime;

    private LocalTime endTime;

    private String location;

    private BigDecimal cost;

    private Double latitude;

    private Double longitude;
}
