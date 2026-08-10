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
import com.tripnest.backend.service.TripService;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

	private final TripRepository tripRepository;
	
	private final UserRepository userRepository;

	private final TripService tripService;
	
	private User getCurrentUser() {

	    Authentication authentication =
	            SecurityContextHolder.getContext().getAuthentication();

	    String email = authentication.getName();

	    return userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("User not found"));
	}
	
	@Override
	@Transactional
	public ApiResponse<DashboardResponse> getDashboard() {
		User user = getCurrentUser();

		org.springframework.data.jpa.domain.Specification<Trip> spec = (root, query, cb) -> {
			jakarta.persistence.criteria.Join<Trip, com.tripnest.backend.entity.TripMember> membersJoin = root.join("tripMembers", jakarta.persistence.criteria.JoinType.LEFT);
			return cb.or(
					cb.equal(root.get("user"), user),
					cb.and(
							cb.equal(membersJoin.get("user"), user),
							cb.equal(membersJoin.get("status"), "ACCEPTED")
					)
			);
		};
		List<Trip> trips = tripRepository.findAll(spec).stream().distinct().collect(java.util.stream.Collectors.toList());
		tripService.syncTripStatuses(trips);
		long totalTrips = trips.size();

		java.time.LocalDate today = java.time.LocalDate.now();

		long upcomingTrips = trips.stream()
		        .filter(trip -> trip.getStatus() != TripStatus.CANCELLED && today.isBefore(trip.getStartDate()))
		        .count();

		long ongoingTrips = trips.stream()
		        .filter(trip -> trip.getStatus() != TripStatus.CANCELLED && !today.isBefore(trip.getStartDate()) && !today.isAfter(trip.getEndDate()))
		        .count();

		long completedTrips = trips.stream()
		        .filter(trip -> trip.getStatus() == TripStatus.COMPLETED || (trip.getStatus() != TripStatus.CANCELLED && today.isAfter(trip.getEndDate())))
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
		        .filter(trip -> trip.getStatus() != TripStatus.CANCELLED && !today.isBefore(trip.getStartDate()) && !today.isAfter(trip.getEndDate()))
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