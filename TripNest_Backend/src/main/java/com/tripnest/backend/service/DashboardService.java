package com.tripnest.backend.service;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.DashboardResponse;

public interface DashboardService {

    ApiResponse<DashboardResponse> getDashboard();

}