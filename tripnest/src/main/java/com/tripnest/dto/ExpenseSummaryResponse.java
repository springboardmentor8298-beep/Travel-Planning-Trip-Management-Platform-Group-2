package com.tripnest.dto;

import java.math.BigDecimal;
import java.util.Map;

public record ExpenseSummaryResponse(BigDecimal totalSpent, Map<String, BigDecimal> byCategory,
                                     BudgetResponse budget) { }
