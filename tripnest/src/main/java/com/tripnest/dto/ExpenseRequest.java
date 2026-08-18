package com.tripnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExpenseRequest {

    @NotBlank
    private String title;

    @NotNull
    private String category;

    @NotNull
    @Positive
    private Double amount;

    private String description;

    private LocalDate expenseDate;
}