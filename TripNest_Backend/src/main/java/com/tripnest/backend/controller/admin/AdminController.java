package com.tripnest.backend.controller.admin;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.admin.AdminDashboardDto;
import com.tripnest.backend.dto.admin.AdminTripResponseDto;
import com.tripnest.backend.dto.admin.AdminUserResponseDto;
import com.tripnest.backend.service.admin.AdminService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripnest.backend.dto.admin.AdminAnalyticsResponse;
import com.tripnest.backend.dto.response.TripMemberResponse;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponseDto>>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponseDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @GetMapping("/trips")
    public ResponseEntity<ApiResponse<List<AdminTripResponseDto>>> getAllTrips() {
        return ResponseEntity.ok(adminService.getAllTrips());
    }

    @GetMapping("/trips/{id}")
    public ResponseEntity<ApiResponse<AdminTripResponseDto>> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getTripById(id));
    }

    @GetMapping("/analytics/overview")
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> getAnalyticsOverview() {
        return ResponseEntity.ok(adminService.getAnalyticsOverview());
    }

    @GetMapping("/trips/{tripId}/members")
    public ResponseEntity<ApiResponse<List<TripMemberResponse>>> getTripMembers(@PathVariable Long tripId) {
        return ResponseEntity.ok(adminService.getTripMembers(tripId));
    }
}
