package com.tripnest.backend.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.AnalyticsResponse;
import com.tripnest.backend.entity.Activity;
import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.service.TripService;
import com.tripnest.backend.entity.enums.ExpenseCategory;
import com.tripnest.backend.entity.enums.TripStatus;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripService tripService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private TripStatus calculateDynamicStatus(Trip trip) {
        return TripStatus.calculateStatus(trip.getStartDate(), trip.getEndDate(), trip.getStatus());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public ApiResponse<AnalyticsResponse> getAnalyticsOverview() {
        User user = getCurrentUser();

        // Query trips that the user has access to (creator/owner, or accepted member)
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
        List<Trip> trips = tripRepository.findAll(spec).stream().distinct().toList();
        tripService.syncTripStatuses(trips);

        long totalTrips = trips.size();
        long activeTrips = 0;
        long upcomingTrips = 0;
        long completedTrips = 0;

        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal remainingBudget = BigDecimal.ZERO;
        BigDecimal estimatedItineraryCost = BigDecimal.ZERO;

        Map<String, BigDecimal> expenseCategoryDistribution = new HashMap<>();
        for (ExpenseCategory category : ExpenseCategory.values()) {
            expenseCategoryDistribution.put(category.name(), BigDecimal.ZERO);
        }

        Map<String, Long> tripStatusDistribution = new HashMap<>();
        tripStatusDistribution.put("ACTIVE", 0L);
        tripStatusDistribution.put("UPCOMING", 0L);
        tripStatusDistribution.put("COMPLETED", 0L);
        tripStatusDistribution.put("CANCELLED", 0L);

        for (Trip trip : trips) {
            // Dynamic trip status distribution
            TripStatus dynamicStatus = calculateDynamicStatus(trip);
            if (dynamicStatus == TripStatus.ACTIVE) {
                activeTrips++;
                tripStatusDistribution.put("ACTIVE", tripStatusDistribution.get("ACTIVE") + 1);
            } else if (dynamicStatus == TripStatus.UPCOMING) {
                upcomingTrips++;
                tripStatusDistribution.put("UPCOMING", tripStatusDistribution.get("UPCOMING") + 1);
            } else if (dynamicStatus == TripStatus.COMPLETED) {
                completedTrips++;
                tripStatusDistribution.put("COMPLETED", tripStatusDistribution.get("COMPLETED") + 1);
            } else if (dynamicStatus == TripStatus.CANCELLED) {
                tripStatusDistribution.put("CANCELLED", tripStatusDistribution.get("CANCELLED") + 1);
            }

            // Budget calculations
            if (trip.getBudget() != null) {
                BigDecimal budgetVal = trip.getBudget().getTotalBudget() != null ? trip.getBudget().getTotalBudget() : BigDecimal.ZERO;
                BigDecimal spentVal = trip.getBudget().getTotalSpent() != null ? trip.getBudget().getTotalSpent() : BigDecimal.ZERO;
                BigDecimal remainingVal = trip.getBudget().getRemainingBudget() != null ? trip.getBudget().getRemainingBudget() : BigDecimal.ZERO;

                totalBudget = totalBudget.add(budgetVal);
                totalSpent = totalSpent.add(spentVal);
                remainingBudget = remainingBudget.add(remainingVal);

                // Expenses distribution
                if (trip.getBudget().getExpenses() != null) {
                    for (Expense expense : trip.getBudget().getExpenses()) {
                        if (expense.getCategory() != null && expense.getAmount() != null) {
                            String catName = expense.getCategory().name();
                            BigDecimal currentAmount = expenseCategoryDistribution.getOrDefault(catName, BigDecimal.ZERO);
                            expenseCategoryDistribution.put(catName, currentAmount.add(expense.getAmount()));
                        }
                    }
                }
            }

            // Estimated Itinerary Cost
            if (trip.getItineraries() != null) {
                for (Itinerary itinerary : trip.getItineraries()) {
                    if (itinerary.getActivities() != null) {
                        for (Activity activity : itinerary.getActivities()) {
                            if (activity.getCost() != null) {
                                estimatedItineraryCost = estimatedItineraryCost.add(activity.getCost());
                            }
                        }
                    }
                }
            }
        }

        // Calculate and clamp utilization percentage: (totalSpent / totalBudget) * 100
        double budgetUtilization = 0.0;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            if (totalSpent.compareTo(totalBudget) >= 0) {
                budgetUtilization = 100.0;
            } else if (totalSpent.compareTo(BigDecimal.ZERO) <= 0) {
                budgetUtilization = 0.0;
            } else {
                budgetUtilization = totalSpent.doubleValue() / totalBudget.doubleValue() * 100.0;
                if (budgetUtilization > 100.0) {
                    budgetUtilization = 100.0;
                } else if (budgetUtilization < 0.0) {
                    budgetUtilization = 0.0;
                }
            }
        }

        AnalyticsResponse response = AnalyticsResponse.builder()
                .totalTrips(totalTrips)
                .activeTrips(activeTrips)
                .upcomingTrips(upcomingTrips)
                .completedTrips(completedTrips)
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .remainingBudget(remainingBudget)
                .budgetUtilization(budgetUtilization)
                .estimatedItineraryCost(estimatedItineraryCost)
                .expenseCategoryDistribution(expenseCategoryDistribution)
                .tripStatusDistribution(tripStatusDistribution)
                .build();

        return ApiResponse.<AnalyticsResponse>builder()
                .success(true)
                .message("Analytics overview fetched successfully")
                .data(response)
                .build();
    }
}
