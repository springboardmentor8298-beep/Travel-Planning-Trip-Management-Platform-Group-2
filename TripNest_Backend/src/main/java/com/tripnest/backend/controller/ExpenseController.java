package com.tripnest.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateExpenseRequest;
import com.tripnest.backend.dto.response.ExpenseResponse;
import com.tripnest.backend.service.ExpenseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/{budgetId}/expenses")
    public ApiResponse<ExpenseResponse> createExpense(
            @PathVariable Long budgetId,
            @Valid @RequestBody CreateExpenseRequest request) {

        return expenseService.createExpense(budgetId, request);
    }

    @GetMapping("/{budgetId}/expenses")
    public ApiResponse<List<ExpenseResponse>> getExpenses(
            @PathVariable Long budgetId) {

        return expenseService.getExpenses(budgetId);
    }
    
    @PutMapping("/expenses/{expenseId}")
    public ApiResponse<ExpenseResponse> updateExpense(
            @PathVariable Long expenseId,
            @Valid @RequestBody CreateExpenseRequest request) {

        return expenseService.updateExpense(expenseId, request);
    }

    @DeleteMapping("/expenses/{expenseId}")
    public ApiResponse<String> deleteExpense(
            @PathVariable Long expenseId) {

        return expenseService.deleteExpense(expenseId);
    }
}