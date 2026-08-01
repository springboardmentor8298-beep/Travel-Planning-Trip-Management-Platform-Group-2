package com.tripnest.backend.dto.response;

import java.math.BigDecimal;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {

    private Long id;

    private BigDecimal totalBudget;

    private BigDecimal totalSpent;

    private BigDecimal remainingBudget;

    private Long tripId;

    private Double utilizationPercentage;
}
