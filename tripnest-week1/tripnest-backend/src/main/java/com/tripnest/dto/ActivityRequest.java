package com.tripnest.dto;

import com.tripnest.entity.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ActivityRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Activity type is required")
    private ActivityType type;

    private LocalTime scheduledTime;
    private String location;
    private String notes;
}
