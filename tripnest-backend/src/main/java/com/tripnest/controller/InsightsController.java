package com.tripnest.controller;

import com.tripnest.dto.BudgetInsightsResponse;
import com.tripnest.dto.SettlementResponse;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.SmartInsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trips/{tripId}/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final SmartInsightsService smartInsightsService;

    @GetMapping("/budget")
    public ResponseEntity<BudgetInsightsResponse> getBudgetInsights(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(smartInsightsService.getBudgetInsights(email, tripId));
    }

    @GetMapping("/settlement")
    public ResponseEntity<SettlementResponse> getSettlement(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(smartInsightsService.getSettlement(email, tripId));
    }
}
