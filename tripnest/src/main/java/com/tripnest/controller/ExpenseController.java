package com.tripnest.controller;

import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.entity.ExpenseCategory;
import com.tripnest.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/trip/{tripId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.createExpense(tripId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{expenseId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.updateExpense(expenseId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{expenseId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteExpense(@PathVariable Long expenseId) {
        expenseService.deleteExpense(expenseId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trip/{tripId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByTrip(@PathVariable Long tripId) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByTrip(tripId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/trip/{tripId}/category/{category}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByTripAndCategory(
            @PathVariable Long tripId,
            @PathVariable ExpenseCategory category) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByTripAndCategory(tripId, category);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/trip/{tripId}/total")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<BigDecimal> getTotalExpensesByTrip(@PathVariable Long tripId) {
        BigDecimal total = expenseService.getTotalExpensesByTrip(tripId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/trip/{tripId}/by-category")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<ExpenseCategory, BigDecimal>> getExpensesByCategory(@PathVariable Long tripId) {
        Map<ExpenseCategory, BigDecimal> expensesByCategory = expenseService.getExpensesByCategory(tripId);
        return ResponseEntity.ok(expensesByCategory);
    }

    @GetMapping("/trip/{tripId}/date-range")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByDateRange(
            @PathVariable Long tripId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByDateRange(tripId, startDate, endDate);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/group/{groupId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByGroup(@PathVariable Long groupId) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByGroup(groupId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/group/{groupId}/total")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<BigDecimal> getTotalExpensesByGroup(@PathVariable Long groupId) {
        BigDecimal total = expenseService.getTotalExpensesByGroup(groupId);
        return ResponseEntity.ok(total);
    }
}
