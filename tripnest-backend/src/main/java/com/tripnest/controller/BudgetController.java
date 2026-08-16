package com.tripnest.controller;

import com.tripnest.dto.BudgetRequest;
import com.tripnest.dto.BudgetResponse;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips/{tripId}/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PutMapping
    public ResponseEntity<BudgetResponse> setBudget(@PathVariable Long tripId,
                                                     @Valid @RequestBody BudgetRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(email, tripId, request));
    }

    @GetMapping
    public ResponseEntity<BudgetResponse> getBudget(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(budgetService.getBudget(email, tripId));
    }
}
