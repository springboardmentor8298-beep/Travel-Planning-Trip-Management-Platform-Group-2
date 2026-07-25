package com.tripnest.backend.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Objects;

import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.DashboardResponse;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.enums.TripStatus;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

	private final TripRepository tripRepository;
	
	private final UserRepository userRepository;
	
	private User getCurrentUser() {

	    Authentication authentication =
	            SecurityContextHolder.getContext().getAuthentication();

	    String email = authentication.getName();

	    return userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("User not found"));
	}
	
	@Override
	public ApiResponse<DashboardResponse> getDashboard() {
		User user = getCurrentUser();

		List<Trip> trips = tripRepository.findByUser(user);
		long totalTrips = trips.size();

		long upcomingTrips = trips.stream()
		        .filter(trip -> trip.getStatus() == TripStatus.PLANNED)
		        .count();

		long ongoingTrips = trips.stream()
		        .filter(trip -> trip.getStatus() == TripStatus.ONGOING)
		        .count();

		long completedTrips = trips.stream()
		        .filter(trip -> trip.getStatus() == TripStatus.COMPLETED)
		        .count();
		BigDecimal totalBudget = trips.stream()
		        .map(Trip::getBudget)
		        .filter(Objects::nonNull)
		        .map(Budget::getTotalBudget)
		        .reduce(BigDecimal.ZERO, BigDecimal::add);

		BigDecimal totalSpent = trips.stream()
		        .map(Trip::getBudget)
		        .filter(Objects::nonNull)
		        .map(Budget::getTotalSpent)
		        .reduce(BigDecimal.ZERO, BigDecimal::add);

		BigDecimal remainingBudget = trips.stream()
		        .map(Trip::getBudget)
		        .filter(Objects::nonNull)
		        .map(Budget::getRemainingBudget)
		        .reduce(BigDecimal.ZERO, BigDecimal::add);
		DashboardResponse response = DashboardResponse.builder()
		        .totalTrips(totalTrips)
		        .upcomingTrips(upcomingTrips)
		        .ongoingTrips(ongoingTrips)
		        .completedTrips(completedTrips)
		        .totalBudget(totalBudget)
		        .totalSpent(totalSpent)
		        .remainingBudget(remainingBudget)
		        .build();
		
		return ApiResponse.<DashboardResponse>builder()
		        .success(true)
		        .message("Dashboard fetched successfully")
		        .data(response)
		        .build();
	}

	 
    }