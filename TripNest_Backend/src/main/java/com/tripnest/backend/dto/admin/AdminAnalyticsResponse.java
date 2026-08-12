package com.tripnest.backend.dto.admin;

import java.math.BigDecimal;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {

    private Long totalTrips;

    private Long activeTrips;

    private Long upcomingTrips;

    private Long completedTrips;

    private BigDecimal totalBudget;

    private BigDecimal totalSpent;

    private BigDecimal remainingBudget;

    private Double budgetUtilizationPercentage; // Clamped between 0 and 100

    private BigDecimal totalEstimatedItineraryCost;

    private Map<String, BigDecimal> expenseCategoryDistribution;

    private Map<String, Long> tripStatusDistribution;

    private Long totalUsers;

    private Map<String, Long> destinationDistribution;
}
