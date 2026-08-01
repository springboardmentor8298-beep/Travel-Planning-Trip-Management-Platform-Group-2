package com.tripnest.backend.service;

import java.math.BigDecimal;
import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.BudgetResponse;
import com.tripnest.backend.dto.response.BudgetSummaryResponse;

public interface BudgetService {

    ApiResponse<BudgetResponse> getBudgetById(Long id);

    ApiResponse<BudgetResponse> getBudgetByTripId(Long tripId);

    ApiResponse<BudgetResponse> createBudget(Long tripId, BigDecimal totalBudget);

    ApiResponse<BudgetResponse> updateBudget(Long id, BigDecimal totalBudget);

    ApiResponse<BudgetSummaryResponse> getBudgetSummary(Long id);
}
