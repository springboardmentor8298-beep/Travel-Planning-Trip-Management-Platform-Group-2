package com.tripnest.dto.activity;

import com.tripnest.entity.Activity;
import com.tripnest.entity.enums.ActivityType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter
@Builder
public class ActivityResponse {
    private Long id;
    private Long itineraryId;
    private String title;
    private ActivityType activityType;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private BigDecimal estimatedCost;
    private String notes;
    private boolean reminderEnabled;

    public static ActivityResponse fromEntity(Activity activity) {
        return ActivityResponse.builder()
                .id(activity.getId())
                .itineraryId(activity.getItinerary().getId())
                .title(activity.getTitle())
                .activityType(activity.getActivityType())
                .startTime(activity.getStartTime())
                .endTime(activity.getEndTime())
                .location(activity.getLocation())
                .estimatedCost(activity.getEstimatedCost())
                .notes(activity.getNotes())
                .reminderEnabled(activity.isReminderEnabled())
                .build();
    }
}
