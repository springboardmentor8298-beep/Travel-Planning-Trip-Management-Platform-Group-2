package com.tripnest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class ReportResponseDTO {

    private List<TripSummaryItem> tripSummary;
    private List<BudgetSummaryItem> budgetSummary;
    private List<ExpenseSummaryItem> expenseSummary;
    private List<TripStatusSummaryItem> statusSummary;
    private List<ActivitySummaryItem> activitySummary;

    public ReportResponseDTO() {
    }

    public List<TripSummaryItem> getTripSummary() {
        return tripSummary;
    }

    public void setTripSummary(List<TripSummaryItem> tripSummary) {
        this.tripSummary = tripSummary;
    }

    public List<BudgetSummaryItem> getBudgetSummary() {
        return budgetSummary;
    }

    public void setBudgetSummary(List<BudgetSummaryItem> budgetSummary) {
        this.budgetSummary = budgetSummary;
    }

    public List<ExpenseSummaryItem> getExpenseSummary() {
        return expenseSummary;
    }

    public void setExpenseSummary(List<ExpenseSummaryItem> expenseSummary) {
        this.expenseSummary = expenseSummary;
    }

    public List<TripStatusSummaryItem> getStatusSummary() {
        return statusSummary;
    }

    public void setStatusSummary(List<TripStatusSummaryItem> statusSummary) {
        this.statusSummary = statusSummary;
    }

    public List<ActivitySummaryItem> getActivitySummary() {
        return activitySummary;
    }

    public void setActivitySummary(List<ActivitySummaryItem> activitySummary) {
        this.activitySummary = activitySummary;
    }

    public static class TripSummaryItem {
        private Integer tripId;
        private String tripName;
        private String destination;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private Integer numberOfTravelers;
        private BigDecimal budgetAllocated;
        private BigDecimal totalExpenses;
        private BigDecimal remainingBudget;
        private int activityCount;

        public TripSummaryItem() {
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

        public String getDestination() {
            return destination;
        }

        public void setDestination(String destination) {
            this.destination = destination;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getNumberOfTravelers() {
            return numberOfTravelers;
        }

        public void setNumberOfTravelers(Integer numberOfTravelers) {
            this.numberOfTravelers = numberOfTravelers;
        }

        public BigDecimal getBudgetAllocated() {
            return budgetAllocated;
        }

        public void setBudgetAllocated(BigDecimal budgetAllocated) {
            this.budgetAllocated = budgetAllocated;
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

        public int getActivityCount() {
            return activityCount;
        }

        public void setActivityCount(int activityCount) {
            this.activityCount = activityCount;
        }
    }

    public static class BudgetSummaryItem {
        private Integer tripId;
        private String tripName;
        private BigDecimal totalBudget;
        private BigDecimal totalSpent;
        private BigDecimal remainingBudget;
        private Double utilizationPercentage;
        private String healthStatus; // ON_TRACK, WARNING, OVER_BUDGET

        public BudgetSummaryItem() {
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

        public BigDecimal getTotalBudget() {
            return totalBudget;
        }

        public void setTotalBudget(BigDecimal totalBudget) {
            this.totalBudget = totalBudget;
        }

        public BigDecimal getTotalSpent() {
            return totalSpent;
        }

        public void setTotalSpent(BigDecimal totalSpent) {
            this.totalSpent = totalSpent;
        }

        public BigDecimal getRemainingBudget() {
            return remainingBudget;
        }

        public void setRemainingBudget(BigDecimal remainingBudget) {
            this.remainingBudget = remainingBudget;
        }

        public Double getUtilizationPercentage() {
            return utilizationPercentage;
        }

        public void setUtilizationPercentage(Double utilizationPercentage) {
            this.utilizationPercentage = utilizationPercentage;
        }

        public String getHealthStatus() {
            return healthStatus;
        }

        public void setHealthStatus(String healthStatus) {
            this.healthStatus = healthStatus;
        }
    }

    public static class ExpenseSummaryItem {
        private Integer expenseId;
        private Integer tripId;
        private String tripName;
        private String category;
        private String title;
        private BigDecimal amount;
        private LocalDate date;
        private String notes;

        public ExpenseSummaryItem() {
        }

        public Integer getExpenseId() {
            return expenseId;
        }

        public void setExpenseId(Integer expenseId) {
            this.expenseId = expenseId;
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

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class TripStatusSummaryItem {
        private String status;
        private long count;
        private Double percentage;

        public TripStatusSummaryItem() {
        }

        public TripStatusSummaryItem(String status, long count, Double percentage) {
            this.status = status;
            this.count = count;
            this.percentage = percentage;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }

        public Double getPercentage() {
            return percentage;
        }

        public void setPercentage(Double percentage) {
            this.percentage = percentage;
        }
    }

    public static class ActivitySummaryItem {
        private Integer activityId;
        private Integer tripId;
        private String tripName;
        private String activityName;
        private String location;
        private LocalDate date;
        private LocalTime time;
        private BigDecimal cost;

        public ActivitySummaryItem() {
        }

        public Integer getActivityId() {
            return activityId;
        }

        public void setActivityId(Integer activityId) {
            this.activityId = activityId;
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

        public String getActivityName() {
            return activityName;
        }

        public void setActivityName(String activityName) {
            this.activityName = activityName;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public LocalTime getTime() {
            return time;
        }

        public void setTime(LocalTime time) {
            this.time = time;
        }

        public BigDecimal getCost() {
            return cost;
        }

        public void setCost(BigDecimal cost) {
            this.cost = cost;
        }
    }
}
