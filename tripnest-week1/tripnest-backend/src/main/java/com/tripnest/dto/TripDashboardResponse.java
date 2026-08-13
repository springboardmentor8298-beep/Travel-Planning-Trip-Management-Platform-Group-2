package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TripDashboardResponse {
    private Long tripId;
    private String title;
    private long totalDays;
    private long plannedItineraryDays;
    private long totalActivities;
    private double budget;
    private String status;
}
