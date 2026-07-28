package com.tripnest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(Long id, Long tripId, String category, String description, BigDecimal amount,
                              String paymentMethod, LocalDate expenseDate, String paidBy) { }
