package com.tripnest.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.AnalyticsResponse;
import com.tripnest.backend.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ApiResponse<AnalyticsResponse> getAnalyticsOverview() {
        return analyticsService.getAnalyticsOverview();
    }
}
