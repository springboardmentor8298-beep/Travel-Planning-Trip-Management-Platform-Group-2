package com.tripnest.controller;

import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/api/trips/{tripId}/expenses")
    public ResponseEntity<ExpenseResponse> addExpense(@PathVariable Long tripId,
                                                       @Valid @RequestBody ExpenseRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(expenseService.addExpense(email, tripId, request));
    }

    @GetMapping("/api/trips/{tripId}/expenses")
    public ResponseEntity<List<ExpenseResponse>> getExpenses(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(expenseService.getExpensesForTrip(email, tripId));
    }

    @PutMapping("/api/expenses/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(@PathVariable Long expenseId,
                                                          @Valid @RequestBody ExpenseRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(expenseService.updateExpense(email, expenseId, request));
    }

    @DeleteMapping("/api/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long expenseId) {
        String email = SecurityUtils.getCurrentUserEmail();
        expenseService.deleteExpense(email, expenseId);
        return ResponseEntity.noContent().build();
    }
}
