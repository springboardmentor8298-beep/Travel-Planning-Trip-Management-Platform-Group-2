package com.tripnest.dto;

import com.tripnest.entity.ExpenseCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExpenseRequest {

    @NotNull(message = "Category is required")
    private ExpenseCategory category;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private Double amount;

    private String description;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    // Optional - id of a previously uploaded document to attach as the receipt
    private Long receiptDocumentId;
}
