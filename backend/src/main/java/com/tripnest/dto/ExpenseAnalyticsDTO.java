package com.tripnest.dto;

import com.tripnest.entity.Expense;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ExpenseAnalyticsDTO {
    private BigDecimal totalBudget;
    private BigDecimal totalSpending;
    private BigDecimal remainingBudget;
    private Double budgetUtilizationPercentage;
    private Map<String, BigDecimal> spendingByCategory;
    private List<Expense> recentExpenses;

    public ExpenseAnalyticsDTO() {
    }

    public BigDecimal getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget;
    }

    public BigDecimal getTotalSpending() {
        return totalSpending;
    }

    public void setTotalSpending(BigDecimal totalSpending) {
        this.totalSpending = totalSpending;
    }

    public BigDecimal getRemainingBudget() {
        return remainingBudget;
    }

    public void setRemainingBudget(BigDecimal remainingBudget) {
        this.remainingBudget = remainingBudget;
    }

    public Double getBudgetUtilizationPercentage() {
        return budgetUtilizationPercentage;
    }

    public void setBudgetUtilizationPercentage(Double budgetUtilizationPercentage) {
        this.budgetUtilizationPercentage = budgetUtilizationPercentage;
    }

    public Map<String, BigDecimal> getSpendingByCategory() {
        return spendingByCategory;
    }

    public void setSpendingByCategory(Map<String, BigDecimal> spendingByCategory) {
        this.spendingByCategory = spendingByCategory;
    }

    public List<Expense> getRecentExpenses() {
        return recentExpenses;
    }

    public void setRecentExpenses(List<Expense> recentExpenses) {
        this.recentExpenses = recentExpenses;
    }
}
