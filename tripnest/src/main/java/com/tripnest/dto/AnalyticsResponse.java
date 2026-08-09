package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private double totalSpentAllTrips;
    private double totalBudgetAllocated;
    private int totalTrips;
    private Map<String, Double> categoryExpenses;
    private Map<String, Double> monthlyExpenses;
    private List<TripBudgetComparison> tripComparisons;
    private Map<String, Long> topDestinations;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TripBudgetComparison {
        private Long tripId;
        private String tripTitle;
        private double budget;
        private double totalSpent;
    }
}
