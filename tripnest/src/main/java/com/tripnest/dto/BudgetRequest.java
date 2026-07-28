package com.tripnest.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BudgetRequest(@NotNull @DecimalMin(value = "0.00") BigDecimal totalBudget) { }
