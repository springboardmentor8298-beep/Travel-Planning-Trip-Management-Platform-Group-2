package com.tripnest.dto;

import com.tripnest.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Aggregated budget vs. expense summary for a trip.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryResponse {
    private BigDecimal totalBudget;
    private BigDecimal totalSpent;
    private BigDecimal remaining;
    private boolean overBudget;
    /** Amount spent per category */
    private Map<ExpenseCategory, BigDecimal> categoryBreakdown;
}
