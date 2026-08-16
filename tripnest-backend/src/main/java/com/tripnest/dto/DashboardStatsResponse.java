package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalTrips;
    private double totalBudget;
    private double totalExpenses;
    private double averageTripCost;
    private String mostVisited;

    // Milestone 4: quick-glance KPIs
    private String topExpenseCategory;
    private double budgetUtilizationPercent; // totalExpenses / totalBudget * 100, across ALL trips

    // Trip status counts, e.g. {"PLANNED": 2, "ONGOING": 1, "COMPLETED": 0, "CANCELLED": 0}
    private Map<String, Long> statusBreakdown;

    // Expense amounts grouped by category across ALL of the user's trips
    private Map<String, Double> expenseCategoryBreakdown;

    // Last 7 days of spending, oldest first - powers the trend line chart
    private List<DailyExpensePoint> recentExpenseTrend;

    private List<TripResponse> recentTrips;
}
