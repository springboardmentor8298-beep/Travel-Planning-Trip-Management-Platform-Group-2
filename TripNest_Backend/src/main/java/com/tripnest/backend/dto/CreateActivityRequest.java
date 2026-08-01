package com.tripnest.backend.dto;

import java.time.LocalTime;
import java.math.BigDecimal;

import com.tripnest.backend.entity.enums.ActivityType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateActivityRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalTime activityTime;

    @NotNull
    private ActivityType activityType;

    @DecimalMin(value = "0.0", message = "Activity cost must be greater than or equal to 0")
    private BigDecimal cost;

}