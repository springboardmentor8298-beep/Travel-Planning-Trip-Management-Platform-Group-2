package com.tripnest.service;

import com.tripnest.dto.BudgetSummaryResponse;
import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.entity.*;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for expense CRUD and budget summary operations.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;

    private void checkTripAccess(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        boolean isOwner = trip.getUser().getId().equals(userId);
        boolean isMember = tripMemberRepository
                .findByTripIdAndUserId(tripId, userId)
                .map(m -> m.getStatus() == MemberStatus.ACCEPTED)
                .orElse(false);
        if (!isOwner && !isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this trip");
        }
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public ExpenseResponse addExpense(Long tripId, Long userId, ExpenseRequest request) {
        checkTripAccess(tripId, userId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setUser(user);
        applyRequest(expense, request);

        return toResponse(expenseRepository.save(expense));
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByTrip(Long tripId, Long userId) {
        checkTripAccess(tripId, userId);
        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BudgetSummaryResponse getBudgetSummary(Long tripId, Long userId) {
        checkTripAccess(tripId, userId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        BigDecimal totalBudget = trip.getBudget() != null ? trip.getBudget() : BigDecimal.ZERO;
        // BUG 4 fix: SUM() returns NULL when there are no expenses — null-coalesce to ZERO
        BigDecimal totalSpent = Optional.ofNullable(expenseRepository.sumAmountByTripId(tripId))
                .orElse(BigDecimal.ZERO);

        // Build category breakdown
        Map<ExpenseCategory, BigDecimal> breakdown = new EnumMap<>(ExpenseCategory.class);
        for (ExpenseCategory cat : ExpenseCategory.values()) {
            breakdown.put(cat, BigDecimal.ZERO);
        }
        expenseRepository.sumByCategory(tripId).forEach(row -> {
            ExpenseCategory cat = (ExpenseCategory) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            breakdown.put(cat, sum);
        });

        BigDecimal remaining = totalBudget.subtract(totalSpent);
        return new BudgetSummaryResponse(totalBudget, totalSpent, remaining, remaining.compareTo(BigDecimal.ZERO) < 0, breakdown);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public ExpenseResponse updateExpense(Long tripId, Long expenseId, Long userId, ExpenseRequest request) {
        Expense expense = expenseRepository.findByIdAndTripId(expenseId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        // Only the creator can edit
        if (!expense.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your expense");
        }
        applyRequest(expense, request);
        return toResponse(expenseRepository.save(expense));
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public void deleteExpense(Long tripId, Long expenseId, Long userId) {
        Expense expense = expenseRepository.findByIdAndTripId(expenseId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        if (!expense.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your expense");
        }
        expenseRepository.delete(expense);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void applyRequest(Expense expense, ExpenseRequest req) {
        expense.setCategory(req.getCategory());
        expense.setAmount(req.getAmount());
        expense.setDescription(req.getDescription());
        expense.setExpenseDate(req.getExpenseDate());
    }

    public ExpenseResponse toResponse(Expense expense) {
        ExpenseResponse res = new ExpenseResponse();
        res.setId(expense.getId());
        res.setTripId(expense.getTrip().getId());
        res.setUserId(expense.getUser().getId());
        res.setUsername(expense.getUser().getUsername());
        res.setCategory(expense.getCategory());
        res.setAmount(expense.getAmount());
        res.setDescription(expense.getDescription());
        res.setExpenseDate(expense.getExpenseDate());
        res.setCreatedAt(expense.getCreatedAt());
        return res;
    }
}
