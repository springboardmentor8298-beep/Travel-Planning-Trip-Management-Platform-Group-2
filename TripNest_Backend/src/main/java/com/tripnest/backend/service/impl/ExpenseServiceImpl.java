package com.tripnest.backend.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateExpenseRequest;
import com.tripnest.backend.dto.response.ExpenseResponse;
import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.BudgetRepository;
import com.tripnest.backend.repository.ExpenseRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.ExpenseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    private void validateBudgetOwnership(Budget budget) {
        User currentUser = getCurrentUser();
        if (!budget.getTrip().getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to access or modify this budget.");
        }
    }

    @Override
    @Transactional
    public ApiResponse<ExpenseResponse> createExpense(
            Long budgetId,
            CreateExpenseRequest request) {

        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Budget not found"));

        validateBudgetOwnership(budget);

        Expense expense = Expense.builder()
                .amount(request.getAmount())
                .category(request.getCategory())
                .description(request.getDescription())
                .expenseDate(request.getExpenseDate())
                .budget(budget)
                .build();

        expense = expenseRepository.save(expense);

        // Update Budget
        budget.setTotalSpent(
                budget.getTotalSpent().add(expense.getAmount()));

        budget.setRemainingBudget(
                budget.getTotalBudget().subtract(budget.getTotalSpent()));

        budgetRepository.save(budget);

        ExpenseResponse response = ExpenseResponse.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .build();

        return ApiResponse.<ExpenseResponse>builder()
                .success(true)
                .message("Expense added successfully")
                .data(response)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<ExpenseResponse>> getExpenses(Long budgetId) {

        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Budget not found"));

        validateBudgetOwnership(budget);

        List<ExpenseResponse> response = expenseRepository
                .findByBudget(budget)
                .stream()
                .map(expense -> ExpenseResponse.builder()
                        .id(expense.getId())
                        .amount(expense.getAmount())
                        .category(expense.getCategory())
                        .description(expense.getDescription())
                        .expenseDate(expense.getExpenseDate())
                        .build())
                .toList();

        return ApiResponse.<List<ExpenseResponse>>builder()
                .success(true)
                .message("Expenses fetched successfully")
                .data(response)
                .build();
    }
    
    @Override
    @Transactional
    public ApiResponse<ExpenseResponse> updateExpense(
            Long expenseId,
            CreateExpenseRequest request) {

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Expense not found"));

        validateBudgetOwnership(expense.getBudget());

        Budget budget = expense.getBudget();

        // Remove old amount
        budget.setTotalSpent(
                budget.getTotalSpent().subtract(expense.getAmount()));

        // Update expense
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        // Add new amount
        budget.setTotalSpent(
                budget.getTotalSpent().add(expense.getAmount()));

        budget.setRemainingBudget(
                budget.getTotalBudget()
                        .subtract(budget.getTotalSpent()));

        expenseRepository.save(expense);
        budgetRepository.save(budget);

        ExpenseResponse response = ExpenseResponse.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .build();

        return ApiResponse.<ExpenseResponse>builder()
                .success(true)
                .message("Expense updated successfully")
                .data(response)
                .build();
    }
    
    @Override
    @Transactional
    public ApiResponse<String> deleteExpense(Long expenseId) {

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Expense not found"));

        validateBudgetOwnership(expense.getBudget());

        Budget budget = expense.getBudget();

        budget.setTotalSpent(
                budget.getTotalSpent().subtract(expense.getAmount()));

        budget.setRemainingBudget(
                budget.getTotalBudget()
                        .subtract(budget.getTotalSpent()));

        budgetRepository.save(budget);
        expenseRepository.delete(expense);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Expense deleted successfully")
                .data("Expense deleted successfully")
                .build();
    }
}