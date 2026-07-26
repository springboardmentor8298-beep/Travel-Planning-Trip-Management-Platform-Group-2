package com.tripnest.service;

import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.entity.Expense;
import com.tripnest.entity.ExpenseCategory;
import com.tripnest.entity.Trip;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;

    public ExpenseResponse createExpense(Long tripId, ExpenseRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        Expense expense = new Expense();
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setNotes(request.getNotes());
        expense.setTrip(trip);

        Expense savedExpense = expenseRepository.save(expense);
        return mapToResponse(savedExpense);
    }

    public ExpenseResponse updateExpense(Long expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setNotes(request.getNotes());

        Expense updatedExpense = expenseRepository.save(expense);
        return mapToResponse(updatedExpense);
    }

    public void deleteExpense(Long expenseId) {
        expenseRepository.deleteById(expenseId);
    }

    public List<ExpenseResponse> getExpensesByTrip(Long tripId) {
        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByTripAndCategory(Long tripId, ExpenseCategory category) {
        return expenseRepository.findByTripIdAndCategoryOrderByExpenseDateDesc(tripId, category)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalExpensesByTrip(Long tripId) {
        return expenseRepository.getTotalExpensesByTripId(tripId);
    }

    public Map<ExpenseCategory, BigDecimal> getExpensesByCategory(Long tripId) {
        List<Object[]> results = expenseRepository.getExpensesByCategoryForTrip(tripId);
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (ExpenseCategory) result[0],
                        result -> (BigDecimal) result[1]
                ));
    }

    public List<ExpenseResponse> getExpensesByDateRange(Long tripId, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByTripIdAndDateRange(tripId, startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByGroup(Long groupId) {
        return expenseRepository.findByTravelGroupIdOrderByExpenseDateDesc(groupId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalExpensesByGroup(Long groupId) {
        return expenseRepository.getTotalExpensesByGroupId(groupId);
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getExpenseDate(),
                expense.getPaymentMethod(),
                expense.getNotes(),
                expense.getTrip().getId()
        );
    }
}
