package com.tripnest.backend.service.admin;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.admin.AdminDashboardDto;
import com.tripnest.backend.dto.admin.AdminTripResponseDto;
import com.tripnest.backend.dto.admin.AdminUserResponseDto;
import com.tripnest.backend.dto.admin.AdminAnalyticsResponse;
import com.tripnest.backend.dto.response.TripMemberResponse;
import java.util.List;

public interface AdminService {

    ApiResponse<AdminDashboardDto> getDashboardStats();

    ApiResponse<List<AdminUserResponseDto>> getAllUsers();

    ApiResponse<AdminUserResponseDto> getUserById(Long id);

    ApiResponse<List<AdminTripResponseDto>> getAllTrips();

    ApiResponse<AdminTripResponseDto> getTripById(Long id);

    ApiResponse<AdminAnalyticsResponse> getAnalyticsOverview();

    ApiResponse<List<TripMemberResponse>> getTripMembers(Long tripId);
}
