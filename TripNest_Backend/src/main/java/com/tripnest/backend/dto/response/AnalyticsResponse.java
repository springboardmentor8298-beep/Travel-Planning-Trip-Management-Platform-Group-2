package com.tripnest.backend.dto.response;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalyticsResponse {

    private Long totalTrips;

    private Long activeTrips;

    private Long upcomingTrips;

    private Long completedTrips;

    private BigDecimal totalBudget;

    private BigDecimal totalSpent;

    private BigDecimal remainingBudget;

    private Double budgetUtilization; // Clamp 0 to 100

    private BigDecimal estimatedItineraryCost;

    private Map<String, BigDecimal> expenseCategoryDistribution;

    private Map<String, Long> tripStatusDistribution;
}
