package com.tripnest.controller;

import com.tripnest.dto.AdminAnalyticsResponse;
import com.tripnest.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Demonstrates role-based access control (RBAC) AND serves the real
 * Admin Dashboard analytics.
 * Two layers of protection are shown here on purpose for the review:
 *  1. URL-level:    SecurityConfig -> "/api/admin/**" requires ROLE_ADMINISTRATOR
 *  2. Method-level:  @PreAuthorize on each method, redundant but shows both patterns
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/dashboard-stub")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public Map<String, String> adminOnly() {
        return Map.of("message", "You have ADMINISTRATOR access.");
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminAnalyticsService.getAnalytics());
    }
}
