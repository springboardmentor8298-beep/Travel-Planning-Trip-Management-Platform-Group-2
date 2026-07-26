package com.tripnest.controller;

import com.tripnest.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/user")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserAnalytics(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        Map<String, Object> analytics = analyticsService.getUserAnalytics(userId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/trip/{tripId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTripAnalytics(@PathVariable Long tripId) {
        Map<String, Object> analytics = analyticsService.getTripAnalytics(tripId);
        return ResponseEntity.ok(analytics);
    }
}
