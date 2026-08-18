package com.tripnest.dto;

import lombok.Data;

@Data
public class DashboardAnalyticsResponse {

    private long totalTrips;
    private long planningTrips;
    private long upcomingTrips;
    private long completedTrips;

    private double totalBudget;
    private double averageBudget;
}