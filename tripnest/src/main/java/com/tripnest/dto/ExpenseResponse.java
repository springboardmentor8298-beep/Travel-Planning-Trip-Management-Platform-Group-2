package com.tripnest.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExpenseResponse {

    private Long id;

    private String title;

    private String category;

    private Double amount;

    private String description;

    private LocalDate expenseDate;

    private Long tripId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}