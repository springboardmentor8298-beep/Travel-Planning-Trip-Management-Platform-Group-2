package com.tripnest.service;

import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.entity.Budget;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                          TripRepository tripRepository,
                          BudgetRepository budgetRepository,
                          UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    public List<ExpenseResponse> getExpensesByTripId(Long tripId) {
        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId).stream()
                .map(this::toResponse).toList();
    }

    public ExpenseResponse addExpense(ExpenseRequest request) {
        if (request.getTripId() == null) {
            throw new RuntimeException("Trip ID is required");
        }
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Expense expense = new Expense();
        expense.setTrip(trip);
        if (request.getBudgetId() != null) {
            Budget budget = budgetRepository.findById(request.getBudgetId()).orElse(null);
            if (budget != null) expense.setBudget(budget);
        }
        if (request.getCategory() == null || request.getCategory().isEmpty()) {
            throw new RuntimeException("Expense category is required");
        }
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription() != null ? request.getDescription() : "");
        if (request.getAmount() == null) {
            throw new RuntimeException("Expense amount is required");
        }
        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        expense.setExpenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now());
        expense.setIsPaid(request.getIsPaid() != null ? request.getIsPaid() : false);

        return toResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (request.getCategory() != null) expense.setCategory(request.getCategory());
        if (request.getDescription() != null) expense.setDescription(request.getDescription());
        if (request.getAmount() != null) expense.setAmount(request.getAmount());
        if (request.getCurrency() != null) expense.setCurrency(request.getCurrency());
        if (request.getExpenseDate() != null) expense.setExpenseDate(request.getExpenseDate());
        if (request.getIsPaid() != null) expense.setIsPaid(request.getIsPaid());
        if (request.getBudgetId() != null) {
            Budget budget = budgetRepository.findById(request.getBudgetId()).orElse(null);
            if (budget != null) expense.setBudget(budget);
        }

        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        expenseRepository.delete(expense);
    }

    private User getCurrentUserOrNull() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                return (User) auth.getPrincipal();
            }
        } catch (Exception ignored) {}
        return null;
    }

    private ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getTrip().getId(),
                e.getBudget() != null ? e.getBudget().getId() : null,
                e.getCategory(),
                e.getDescription(),
                e.getAmount(),
                e.getCurrency(),
                e.getExpenseDate(),
                e.getIsPaid(),
                e.getCreatedAt()
        );
    }
}
