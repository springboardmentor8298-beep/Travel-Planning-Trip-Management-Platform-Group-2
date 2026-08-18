package com.tripnest.controller;

import com.tripnest.dto.DashboardAnalyticsResponse;
import com.tripnest.security.UserDetailsImpl;
import com.tripnest.service.DashboardAnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardAnalyticsController {

    private final DashboardAnalyticsService analyticsService;

    public DashboardAnalyticsController(
            DashboardAnalyticsService analyticsService
    ) {
        this.analyticsService =
                analyticsService;
    }

    @GetMapping("/analytics")
    public ResponseEntity<DashboardAnalyticsResponse>
    getAnalytics() {

        UserDetailsImpl user =
                getCurrentUser();

        DashboardAnalyticsResponse response =
                analyticsService.getAnalytics(
                        user.getId()
                );

        return ResponseEntity.ok(response);
    }

    private UserDetailsImpl getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (UserDetailsImpl)
                authentication.getPrincipal();
    }
}