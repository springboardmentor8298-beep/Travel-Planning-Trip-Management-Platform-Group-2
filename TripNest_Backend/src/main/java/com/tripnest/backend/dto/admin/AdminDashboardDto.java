package com.tripnest.backend.dto.admin;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {

    private long totalUsers;
    private long totalTrips;
    private long activeTrips;
    private long upcomingTrips;
    private long completedTrips;
    private BigDecimal totalBudget;
    private BigDecimal totalExpenses;
    private long totalDocuments;
}
