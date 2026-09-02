package com.tripnest.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    private long totalTrips;
    private long upcomingTrips;
    private long completedTrips;
    private long cancelledTrips;
    private long planningTrips;

    private BigDecimal totalBudget;
    private BigDecimal totalExpenses;
    private BigDecimal remainingBudget;
    private Double budgetUtilization;

    private Map<String, BigDecimal> expenseByCategory;
    private Map<String, Long> tripStatusDistribution;
    private List<TripBudgetComparisonDTO> budgetVsExpense;
    private List<MonthlySpendingDTO> monthlySpending;
    private Map<String, Long> upcomingVsCompleted;

    public AnalyticsDTO() {
    }

    public long getTotalTrips() {
        return totalTrips;
    }

    public void setTotalTrips(long totalTrips) {
        this.totalTrips = totalTrips;
    }

    public long getUpcomingTrips() {
        return upcomingTrips;
    }

    public void setUpcomingTrips(long upcomingTrips) {
        this.upcomingTrips = upcomingTrips;
    }

    public long getCompletedTrips() {
        return completedTrips;
    }

    public void setCompletedTrips(long completedTrips) {
        this.completedTrips = completedTrips;
    }

    public long getCancelledTrips() {
        return cancelledTrips;
    }

    public void setCancelledTrips(long cancelledTrips) {
        this.cancelledTrips = cancelledTrips;
    }

    public long getPlanningTrips() {
        return planningTrips;
    }

    public void setPlanningTrips(long planningTrips) {
        this.planningTrips = planningTrips;
    }

    public BigDecimal getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getRemainingBudget() {
        return remainingBudget;
    }

    public void setRemainingBudget(BigDecimal remainingBudget) {
        this.remainingBudget = remainingBudget;
    }

    public Double getBudgetUtilization() {
        return budgetUtilization;
    }

    public void setBudgetUtilization(Double budgetUtilization) {
        this.budgetUtilization = budgetUtilization;
    }

    public Map<String, BigDecimal> getExpenseByCategory() {
        return expenseByCategory;
    }

    public void setExpenseByCategory(Map<String, BigDecimal> expenseByCategory) {
        this.expenseByCategory = expenseByCategory;
    }

    public Map<String, Long> getTripStatusDistribution() {
        return tripStatusDistribution;
    }

    public void setTripStatusDistribution(Map<String, Long> tripStatusDistribution) {
        this.tripStatusDistribution = tripStatusDistribution;
    }

    public List<TripBudgetComparisonDTO> getBudgetVsExpense() {
        return budgetVsExpense;
    }

    public void setBudgetVsExpense(List<TripBudgetComparisonDTO> budgetVsExpense) {
        this.budgetVsExpense = budgetVsExpense;
    }

    public List<MonthlySpendingDTO> getMonthlySpending() {
        return monthlySpending;
    }

    public void setMonthlySpending(List<MonthlySpendingDTO> monthlySpending) {
        this.monthlySpending = monthlySpending;
    }

    public Map<String, Long> getUpcomingVsCompleted() {
        return upcomingVsCompleted;
    }

    public void setUpcomingVsCompleted(Map<String, Long> upcomingVsCompleted) {
        this.upcomingVsCompleted = upcomingVsCompleted;
    }

    public static class TripBudgetComparisonDTO {
        private Integer tripId;
        private String tripName;
        private BigDecimal budget;
        private BigDecimal spent;

        public TripBudgetComparisonDTO() {
        }

        public TripBudgetComparisonDTO(Integer tripId, String tripName, BigDecimal budget, BigDecimal spent) {
            this.tripId = tripId;
            this.tripName = tripName;
            this.budget = budget;
            this.spent = spent;
        }

        public Integer getTripId() {
            return tripId;
        }

        public void setTripId(Integer tripId) {
            this.tripId = tripId;
        }

        public String getTripName() {
            return tripName;
        }

        public void setTripName(String tripName) {
            this.tripName = tripName;
        }

        public BigDecimal getBudget() {
            return budget;
        }

        public void setBudget(BigDecimal budget) {
            this.budget = budget;
        }

        public BigDecimal getSpent() {
            return spent;
        }

        public void setSpent(BigDecimal spent) {
            this.spent = spent;
        }
    }

    public static class MonthlySpendingDTO {
        private String month;
        private int year;
        private BigDecimal amount;

        public MonthlySpendingDTO() {
        }

        public MonthlySpendingDTO(String month, int year, BigDecimal amount) {
            this.month = month;
            this.year = year;
            this.amount = amount;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public int getYear() {
            return year;
        }

        public void setYear(int year) {
            this.year = year;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
    }
}
