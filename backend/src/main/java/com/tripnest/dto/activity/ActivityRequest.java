package com.tripnest.dto.activity;

import com.tripnest.entity.enums.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter
@Setter
public class ActivityRequest {

    @NotBlank(message = "Activity title is required")
    @Size(max = 150)
    private String title;

    @NotNull(message = "Activity type is required")
    private ActivityType activityType;

    private LocalTime startTime;
    private LocalTime endTime;

    @Size(max = 255)
    private String location;

    private BigDecimal estimatedCost;

    private String notes;

    private boolean reminderEnabled = false;
}
