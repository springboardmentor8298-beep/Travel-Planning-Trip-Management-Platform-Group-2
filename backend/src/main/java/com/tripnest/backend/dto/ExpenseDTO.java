package com.tripnest.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ExpenseDTO {

    public static class ExpenseRequest {
        private String title;
        private BigDecimal amount;
        private String category;
        private LocalDate date;
        private List<Long> splitUserIds;

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

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public List<Long> getSplitUserIds() {
            return splitUserIds;
        }

        public void setSplitUserIds(List<Long> splitUserIds) {
            this.splitUserIds = splitUserIds;
        }
    }

    public static class ExpenseSummaryResponse {
        private BigDecimal totalBudget;
        private BigDecimal totalSpent;
        private BigDecimal remainingBudget;
        private Map<String, BigDecimal> categoryBreakdown;
        private boolean isOverBudget;

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

        public Map<String, BigDecimal> getCategoryBreakdown() {
            return categoryBreakdown;
        }

        public void setCategoryBreakdown(Map<String, BigDecimal> categoryBreakdown) {
            this.categoryBreakdown = categoryBreakdown;
        }

        public boolean isOverBudget() {
            return isOverBudget;
        }

        public void setOverBudget(boolean overBudget) {
            isOverBudget = overBudget;
        }
    }
}
