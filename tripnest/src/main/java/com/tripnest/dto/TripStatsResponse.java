package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO containing aggregated trip statistics for the dashboard.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TripStatsResponse {

    private long totalTrips;
    private long plannedTrips;
    private long ongoingTrips;
    private long completedTrips;
    private long cancelledTrips;
}
