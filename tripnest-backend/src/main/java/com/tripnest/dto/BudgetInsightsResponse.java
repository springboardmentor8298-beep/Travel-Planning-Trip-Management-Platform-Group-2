package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BudgetInsightsResponse {
    private Long tripId;
    private Double totalBudget;
    private Double totalSpentSoFar;
    private long daysElapsed;
    private long totalTripDays;
    private long daysRemaining;

    // The core "innovative" numbers
    private Double dailyBurnRate;          // average spend per day so far
    private Double projectedTotalSpend;    // burnRate * totalTripDays
    private Double projectedOverspendAmount; // projectedTotalSpend - totalBudget (can be negative = under budget)
    private Double budgetUtilizationPercent;      // totalSpentSoFar / totalBudget * 100
    private Double projectedUtilizationPercent;   // projectedTotalSpend / totalBudget * 100

    private String riskLevel;   // SAFE | WARNING | CRITICAL
    private String riskMessage; // human-readable explanation for the UI
}
