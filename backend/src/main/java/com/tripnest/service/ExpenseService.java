package com.tripnest.service;

import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.Expense;
import com.tripnest.model.Trip;
import com.tripnest.model.User;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final TripAccessService tripAccessService;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository,
                          TripAccessService tripAccessService) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.tripAccessService = tripAccessService;
    }

    public List<ExpenseResponse> getExpenses(String email, Long tripId) {
        tripAccessService.findAccessibleTrip(email, tripId);
        return expenseRepository.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId)
                .stream()
                .map(ExpenseResponse::fromEntity)
                .toList();
    }

    public ExpenseResponse addExpense(String email, Long tripId, ExpenseRequest request) {
        Trip trip = tripAccessService.findAccessibleTrip(email, tripId);
        User paidBy = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Expense expense = new Expense();
        applyRequest(expense, request);
        expense.setTrip(trip);
        expense.setPaidBy(paidBy);
        return ExpenseResponse.fromEntity(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(String email, Long tripId, Long expenseId, ExpenseRequest request) {
        tripAccessService.findAccessibleTrip(email, tripId);
        Expense expense = findExpenseForTrip(expenseId, tripId);
        applyRequest(expense, request);
        return ExpenseResponse.fromEntity(expenseRepository.save(expense));
    }

    public void deleteExpense(String email, Long tripId, Long expenseId) {
        tripAccessService.findAccessibleTrip(email, tripId);
        Expense expense = findExpenseForTrip(expenseId, tripId);
        expenseRepository.delete(expense);
    }

    public Map<String, Object> getExpenseSummary(String email, Long tripId) {
        Trip trip = tripAccessService.findAccessibleTrip(email, tripId);
        List<ExpenseResponse> expenses = expenseRepository.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId)
                .stream()
                .map(ExpenseResponse::fromEntity)
                .toList();
        BigDecimal totalSpent = expenses.stream()
                .map(ExpenseResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> categoryTotals = new LinkedHashMap<>();
        expenses.forEach(expense ->
                categoryTotals.merge(expense.getCategory(), expense.getAmount(), BigDecimal::add));

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("plannedBudget", trip.getBudget());
        summary.put("totalSpent", totalSpent);
        summary.put("remainingBudget", trip.getBudget() == null ? null : trip.getBudget().subtract(totalSpent));
        summary.put("expenseCount", expenses.size());
        summary.put("categoryTotals", categoryTotals);
        return summary;
    }

    private Expense findExpenseForTrip(Long expenseId, Long tripId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if (!expense.getTrip().getId().equals(tripId)) {
            throw new ResourceNotFoundException("Expense not found for this trip");
        }
        return expense;
    }

    private void applyRequest(Expense expense, ExpenseRequest request) {
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setNotes(request.getNotes());
    }
}
