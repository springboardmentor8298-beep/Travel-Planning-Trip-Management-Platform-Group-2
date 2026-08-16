package com.tripnest.dto;

import com.tripnest.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private Long tripId;
    private String paidByEmail;
    private String paidByName;
    private ExpenseCategory category;
    private Double amount;
    private String description;
    private LocalDate expenseDate;
    private Long receiptDocumentId;
}
