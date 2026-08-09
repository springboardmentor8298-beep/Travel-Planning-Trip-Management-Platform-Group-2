package com.tripnest.controller;

import com.tripnest.dto.BudgetSummaryResponse;
import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.security.services.UserDetailsImpl;
import com.tripnest.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for expense management under a trip.
 *
 * Routes:
 *   GET    /api/trips/{tripId}/expenses          — list expenses
 *   POST   /api/trips/{tripId}/expenses          — add expense
 *   PUT    /api/trips/{tripId}/expenses/{id}     — update expense
 *   DELETE /api/trips/{tripId}/expenses/{id}     — delete expense
 *   GET    /api/trips/{tripId}/expenses/summary  — budget summary
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(expenseService.getExpensesByTrip(tripId, currentUser.getId()));
    }

    @GetMapping("/summary")
    public ResponseEntity<BudgetSummaryResponse> getSummary(
            @PathVariable Long tripId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(expenseService.getBudgetSummary(tripId, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.addExpense(tripId, currentUser.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long tripId,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(expenseService.updateExpense(tripId, id, currentUser.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long tripId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        expenseService.deleteExpense(tripId, id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
