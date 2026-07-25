package com.tripnest.backend.dto;

import java.time.LocalTime;

import com.tripnest.backend.entity.enums.ActivityType;

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

}