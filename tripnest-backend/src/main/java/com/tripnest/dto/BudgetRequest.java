package com.tripnest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class BudgetRequest {

    @NotNull(message = "Total budget is required")
    @Positive(message = "Total budget must be greater than zero")
    private Double totalBudget;

    // Optional - category-wise breakdown of the total budget
    @Valid
    private List<CategoryAllocationRequest> categoryAllocations;
}
