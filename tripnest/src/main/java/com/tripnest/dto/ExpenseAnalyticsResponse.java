package com.tripnest.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ExpenseAnalyticsResponse {

    private Long tripId;

    private Double totalBudget;

    private Double totalSpent;

    private Double remainingBudget;

    private Double budgetUsedPercentage;

    private Integer totalExpenses;

    private Double averageExpense;

    private String highestSpendingCategory;

    private Double highestCategoryAmount;

    private Map<String, Double> categoryTotals;
}