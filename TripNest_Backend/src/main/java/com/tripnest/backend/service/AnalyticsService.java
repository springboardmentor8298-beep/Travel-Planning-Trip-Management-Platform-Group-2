package com.tripnest.backend.service;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.AnalyticsResponse;

public interface AnalyticsService {

    ApiResponse<AnalyticsResponse> getAnalyticsOverview();
}
