package com.tripnest.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public record ActivityRequest(@NotBlank String activityName, @NotBlank String activityType,
                              @NotBlank String location, String startTime, String endTime,
                              Integer durationMinutes, String notes, String status, Integer sortOrder,
                              LocalDateTime reminderAt) { }
