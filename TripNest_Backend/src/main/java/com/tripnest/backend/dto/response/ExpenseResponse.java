package com.tripnest.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.tripnest.backend.entity.enums.ExpenseCategory;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExpenseResponse {

    private Long id;

    private BigDecimal amount;

    private ExpenseCategory category;

    private String description;

    private LocalDate expenseDate;
}