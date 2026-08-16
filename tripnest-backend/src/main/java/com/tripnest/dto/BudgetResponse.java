package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long tripId;
    private Double totalBudget;
    private Double totalSpent;
    private Double remainingBudget;
    private List<CategoryAllocationResponse> categoryAllocations;
}
