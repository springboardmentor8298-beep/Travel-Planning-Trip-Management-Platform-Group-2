package com.tripnest.backend.dto.response;

import java.time.LocalTime;

import com.tripnest.backend.entity.enums.ActivityType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActivityResponse {

    private Long id;

    private String title;

    private String description;

    private LocalTime activityTime;

    private ActivityType activityType;

}