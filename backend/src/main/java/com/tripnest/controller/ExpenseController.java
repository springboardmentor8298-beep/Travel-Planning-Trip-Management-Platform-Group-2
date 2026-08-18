package com.tripnest.controller;

import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public List<ExpenseResponse> getExpenses(@AuthenticationPrincipal UserPrincipal principal,
                                             @PathVariable Long tripId) {
        return expenseService.getExpenses(principal.getUsername(), tripId);
    }

    @GetMapping("/summary")
    public Map<String, Object> getExpenseSummary(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable Long tripId) {
        return expenseService.getExpenseSummary(principal.getUsername(), tripId);
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable Long tripId,
                                                      @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.addExpense(principal.getUsername(), tripId, request));
    }

    @PutMapping("/{expenseId}")
    public ExpenseResponse updateExpense(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable Long tripId,
                                         @PathVariable Long expenseId,
                                         @Valid @RequestBody ExpenseRequest request) {
        return expenseService.updateExpense(principal.getUsername(), tripId, expenseId, request);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable Long tripId,
                                              @PathVariable Long expenseId) {
        expenseService.deleteExpense(principal.getUsername(), tripId, expenseId);
        return ResponseEntity.noContent().build();
    }
}
