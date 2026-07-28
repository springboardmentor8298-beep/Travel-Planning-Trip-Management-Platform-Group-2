package com.tripnest.backend.dto;

import java.time.LocalTime;

import com.tripnest.backend.entity.enums.ActivityType;

import lombok.Data;

@Data
public class UpdateActivityRequest {

    private String title;

    private String description;

    private LocalTime activityTime;

    private ActivityType activityType;

}