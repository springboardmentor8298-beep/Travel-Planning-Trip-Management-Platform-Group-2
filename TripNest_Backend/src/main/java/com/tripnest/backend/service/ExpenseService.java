package com.tripnest.backend.service;

import java.util.List;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateExpenseRequest;
import com.tripnest.backend.dto.response.ExpenseResponse;

public interface ExpenseService {

	ApiResponse<ExpenseResponse> createExpense(
            Long budgetId,
            CreateExpenseRequest request);

    ApiResponse<List<ExpenseResponse>> getExpenses(Long budgetId);
    
    ApiResponse<ExpenseResponse> updateExpense(
            Long expenseId,
            CreateExpenseRequest request);

    ApiResponse<String> deleteExpense(Long expenseId);
}
