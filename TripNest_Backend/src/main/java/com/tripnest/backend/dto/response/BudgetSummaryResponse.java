package com.tripnest.backend.dto.response;

import java.math.BigDecimal;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetSummaryResponse {

    private BigDecimal totalBudget;

    private BigDecimal totalSpent;

    private BigDecimal remainingBudget;

    private BigDecimal estimatedCost;

    private Double utilizationPercentage;

    private String status; // "Within Budget", "Over Budget!"
}
