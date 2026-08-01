package com.tripnest.backend.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.BudgetResponse;
import com.tripnest.backend.dto.response.BudgetSummaryResponse;
import com.tripnest.backend.service.BudgetService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/api/budgets/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudgetById(
            @PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getBudgetById(id));
    }

    @GetMapping("/api/budgets/trip/{tripId}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudgetByTripId(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(budgetService.getBudgetByTripId(tripId));
    }

    @PostMapping("/api/trips/{tripId}/budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @PathVariable Long tripId,
            @RequestBody Map<String, BigDecimal> payload) {
        BigDecimal totalBudget = payload.get("totalBudget");
        return ResponseEntity.ok(budgetService.createBudget(tripId, totalBudget));
    }

    @PutMapping("/api/budgets/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> payload) {
        BigDecimal totalBudget = payload.get("totalBudget");
        return ResponseEntity.ok(budgetService.updateBudget(id, totalBudget));
    }

    @GetMapping("/api/budgets/{id}/summary")
    public ResponseEntity<ApiResponse<BudgetSummaryResponse>> getBudgetSummary(
            @PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getBudgetSummary(id));
    }
}
