package com.tripnest.dto;
import java.time.LocalDateTime;

public record ActivityResponse(Long id, String activityName, String activityType, String location,
                               String startTime, String endTime, Integer durationMinutes,
                               String notes, String status, Integer sortOrder, LocalDateTime reminderAt) { }
