package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class DailyExpensePoint {
    private LocalDate date;
    private Double amount;
}
