package com.tripnest.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.tripnest.backend.entity.enums.ExpenseCategory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateExpenseRequest {

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    private ExpenseCategory category;

    private String description;

    @NotNull
    private LocalDate expenseDate;
}