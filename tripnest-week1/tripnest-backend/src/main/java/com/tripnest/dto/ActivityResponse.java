package com.tripnest.dto;

import com.tripnest.entity.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalTime;

@Data
@AllArgsConstructor
public class ActivityResponse {
    private Long id;
    private Long itineraryId;
    private String title;
    private ActivityType type;
    private LocalTime scheduledTime;
    private String location;
    private String notes;
}
