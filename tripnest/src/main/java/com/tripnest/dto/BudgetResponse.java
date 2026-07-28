package com.tripnest.dto;

import java.math.BigDecimal;

public record BudgetResponse(Long id, Long tripId, BigDecimal totalBudget, BigDecimal spentAmount,
                             BigDecimal remainingBudget, int utilizationPercent, boolean overBudget) { }
