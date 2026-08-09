package com.tripnest.controller;

import com.tripnest.dto.AnalyticsResponse;
import com.tripnest.security.services.UserDetailsImpl;
import com.tripnest.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for travel analytics and expenditure reporting.
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/user")
    public ResponseEntity<AnalyticsResponse> getUserAnalytics(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        AnalyticsResponse response = analyticsService.getTravelerAnalytics(userDetails.getId());
        return ResponseEntity.ok(response);
    }
}
