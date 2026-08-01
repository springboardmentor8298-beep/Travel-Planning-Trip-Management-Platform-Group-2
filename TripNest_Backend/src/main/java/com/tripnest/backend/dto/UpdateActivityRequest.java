package com.tripnest.backend.dto;

import java.time.LocalTime;
import java.math.BigDecimal;

import com.tripnest.backend.entity.enums.ActivityType;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
public class UpdateActivityRequest {

    private String title;

    private String description;

    private LocalTime activityTime;

    private ActivityType activityType;

    @DecimalMin(value = "0.0", message = "Activity cost must be greater than or equal to 0")
    private BigDecimal cost;

}