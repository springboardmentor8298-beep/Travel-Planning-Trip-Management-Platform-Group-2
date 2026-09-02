package com.tripnest.controller;

import com.tripnest.dto.DashboardDTO;
import com.tripnest.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // Get Dashboard Summary
    @GetMapping
    public DashboardDTO getDashboardSummary() {
        return dashboardService.getDashboardSummary();
    }
}