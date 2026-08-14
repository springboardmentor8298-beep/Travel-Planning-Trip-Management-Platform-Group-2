package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewResponse {
    private long totalUsers;
    private long totalTrips;
    private long totalPlannedTrips;
    private long totalOngoingTrips;
    private long totalCompletedTrips;
    private long totalDestinations;
    private long totalExpensesCount;
    private BigDecimal totalPlatformExpenseVolume;
    private Map<String, Long> destinationPopularity;
    private Map<String, Long> userRoleDistribution;
}
