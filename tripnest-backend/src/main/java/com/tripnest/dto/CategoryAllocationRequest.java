package com.tripnest.dto;

import com.tripnest.entity.ExpenseCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class CategoryAllocationRequest {

    @NotNull(message = "Category is required")
    private ExpenseCategory category;

    @NotNull(message = "Allocated amount is required")
    @PositiveOrZero(message = "Allocated amount cannot be negative")
    private Double allocatedAmount;
}
