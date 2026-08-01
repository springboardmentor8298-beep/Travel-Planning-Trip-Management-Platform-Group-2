package com.tripnest.backend.service.impl;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.BudgetResponse;
import com.tripnest.backend.dto.response.BudgetSummaryResponse;
import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.exception.BadRequestException;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.mapper.BudgetMapper;
import com.tripnest.backend.repository.BudgetRepository;
import com.tripnest.backend.repository.TripMemberRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.BudgetService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;
    private final BudgetMapper budgetMapper;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateTripAccess(Trip trip) {
        User currentUser = getCurrentUser();
        if (trip.getUser().getId().equals(currentUser.getId())) {
            return;
        }
        boolean isMember = tripMemberRepository.findByTripAndUser(trip, currentUser)
                .filter(m -> "ACCEPTED".equalsIgnoreCase(m.getStatus()))
                .isPresent();
        if (!isMember) {
            throw new AccessDeniedException("You do not have access to this trip's budget");
        }
    }

    private void validateTripEditPermission(Trip trip) {
        User currentUser = getCurrentUser();
        if (trip.getUser().getId().equals(currentUser.getId())) {
            return;
        }
        String role = tripMemberRepository.findByTripAndUser(trip, currentUser)
                .filter(m -> "ACCEPTED".equalsIgnoreCase(m.getStatus()))
                .map(m -> m.getRole().toUpperCase())
                .orElse("MEMBER");
        if (!"OWNER".equals(role) && !"EDITOR".equals(role)) {
            throw new AccessDeniedException("You do not have permission to modify this trip's budget");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<BudgetResponse> getBudgetById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        validateTripAccess(budget.getTrip());
        return ApiResponse.<BudgetResponse>builder()
                .success(true)
                .message("Budget fetched successfully")
                .data(budgetMapper.toResponse(budget))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<BudgetResponse> getBudgetByTripId(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        validateTripAccess(trip);
        if (trip.getBudget() == null) {
            throw new ResourceNotFoundException("Budget not found for this trip");
        }
        return ApiResponse.<BudgetResponse>builder()
                .success(true)
                .message("Budget fetched successfully")
                .data(budgetMapper.toResponse(trip.getBudget()))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<BudgetResponse> createBudget(Long tripId, BigDecimal totalBudget) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        validateTripEditPermission(trip);

        if (totalBudget == null || totalBudget.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Budget amount must be greater than 0");
        }

        if (trip.getBudget() != null) {
            throw new BadRequestException("Budget already exists for this trip. Use update instead.");
        }

        Budget budget = Budget.builder()
                .totalBudget(totalBudget)
                .totalSpent(BigDecimal.ZERO)
                .remainingBudget(totalBudget)
                .trip(trip)
                .build();

        budget = budgetRepository.save(budget);

        return ApiResponse.<BudgetResponse>builder()
                .success(true)
                .message("Budget created successfully")
                .data(budgetMapper.toResponse(budget))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<BudgetResponse> updateBudget(Long id, BigDecimal totalBudget) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        validateTripEditPermission(budget.getTrip());

        if (totalBudget == null || totalBudget.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Budget amount must be greater than 0");
        }

        if (totalBudget.compareTo(budget.getTotalSpent()) < 0) {
            throw new BadRequestException("New budget limit cannot be lower than the current spent amount: " + budget.getTotalSpent());
        }

        budget.setTotalBudget(totalBudget);
        budget.setRemainingBudget(totalBudget.subtract(budget.getTotalSpent()));
        budget = budgetRepository.save(budget);

        return ApiResponse.<BudgetResponse>builder()
                .success(true)
                .message("Budget updated successfully")
                .data(budgetMapper.toResponse(budget))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<BudgetSummaryResponse> getBudgetSummary(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        validateTripAccess(budget.getTrip());

        // Calculate estimated cost from activities
        BigDecimal estimatedCost = budget.getTrip().getItineraries().stream()
                .flatMap(it -> it.getActivities().stream())
                .map(act -> act.getCost() != null ? act.getCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double utilizationPercentage = 0.0;
        if (budget.getTotalBudget().compareTo(BigDecimal.ZERO) > 0) {
            utilizationPercentage = budget.getTotalSpent().doubleValue() / budget.getTotalBudget().doubleValue() * 100.0;
        }

        String status = budget.getTotalSpent().compareTo(budget.getTotalBudget()) <= 0 ? "Within Budget" : "Over Budget!";

        BudgetSummaryResponse summary = BudgetSummaryResponse.builder()
                .totalBudget(budget.getTotalBudget())
                .totalSpent(budget.getTotalSpent())
                .remainingBudget(budget.getRemainingBudget())
                .estimatedCost(estimatedCost)
                .utilizationPercentage(utilizationPercentage)
                .status(status)
                .build();

        return ApiResponse.<BudgetSummaryResponse>builder()
                .success(true)
                .message("Budget summary retrieved successfully")
                .data(summary)
                .build();
    }
}
