package com.tripnest.controller;

import com.tripnest.dto.BudgetRequest;
import com.tripnest.dto.BudgetResponse;
import com.tripnest.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {
    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<BudgetResponse> getBudgetByTripId(@PathVariable Long tripId) {
        return ResponseEntity.ok(budgetService.getBudgetByTripId(tripId));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createOrUpdateBudget(@RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(request));
    }

    @DeleteMapping("/trip/{tripId}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long tripId) {
        budgetService.deleteBudget(tripId);
        return ResponseEntity.ok().build();
    }
}
