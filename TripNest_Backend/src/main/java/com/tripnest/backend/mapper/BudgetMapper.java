package com.tripnest.backend.mapper;

import org.springframework.stereotype.Component;
import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.dto.response.BudgetResponse;
import java.math.BigDecimal;

@Component
public class BudgetMapper {

    public BudgetResponse toResponse(Budget budget) {
        if (budget == null) {
            return null;
        }
        return BudgetResponse.builder()
                .id(budget.getId())
                .totalBudget(budget.getTotalBudget())
                .totalSpent(budget.getTotalSpent())
                .remainingBudget(budget.getRemainingBudget())
                .tripId(budget.getTrip() != null ? budget.getTrip().getId() : null)
                .utilizationPercentage(calculateUtilization(budget))
                .build();
    }

    public Double calculateUtilization(Budget budget) {
        if (budget == null || budget.getTotalBudget() == null || budget.getTotalBudget().compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return budget.getTotalSpent().doubleValue() / budget.getTotalBudget().doubleValue() * 100.0;
    }
}
