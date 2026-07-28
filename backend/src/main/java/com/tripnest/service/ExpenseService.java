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

    public ExpenseService(ExpenseRepository expenseRepository, TripRepository tripRepository, BudgetRepository budgetRepository) {
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
        this.budgetRepository = budgetRepository;
    }

    public List<ExpenseResponse> getExpensesByTripId(Long tripId) {
        validateTripOwnership(tripId);
        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId).stream()
                .map(this::toResponse).toList();
    }

    public ExpenseResponse addExpense(ExpenseRequest request) {
        Trip trip = validateTripOwnership(request.getTripId());
        Expense expense = new Expense();
        expense.setTrip(trip);
        if (request.getBudgetId() != null) {
            Budget budget = budgetRepository.findById(request.getBudgetId()).orElse(null);
            if (budget != null) expense.setBudget(budget);
        }
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        expense.setExpenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now());
        expense.setIsPaid(request.getIsPaid() != null ? request.getIsPaid() : false);

        return toResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        validateTripOwnership(expense.getTrip().getId());

        if (request.getCategory() != null) expense.setCategory(request.getCategory());
        if (request.getDescription() != null) expense.setDescription(request.getDescription());
        if (request.getAmount() != null) expense.setAmount(request.getAmount());
        if (request.getCurrency() != null) expense.setCurrency(request.getCurrency());
        if (request.getExpenseDate() != null) expense.setExpenseDate(request.getExpenseDate());
        if (request.getIsPaid() != null) expense.setIsPaid(request.getIsPaid());

        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        validateTripOwnership(expense.getTrip().getId());
        expenseRepository.delete(expense);
    }

    private Trip validateTripOwnership(Long tripId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        return trip;
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
