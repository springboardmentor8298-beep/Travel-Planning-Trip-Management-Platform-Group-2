package com.tripnest.backend.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardResponse {

    private Long totalTrips;

    private Long upcomingTrips;

    private Long ongoingTrips;

    private Long completedTrips;

    private BigDecimal totalBudget;

    private BigDecimal totalSpent;

    private BigDecimal remainingBudget;
}