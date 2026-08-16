package com.tripnest.dto;

import com.tripnest.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryAllocationResponse {
    private ExpenseCategory category;
    private Double allocatedAmount;
    private Double spentAmount;
    private Double remainingAmount;
}
