package com.tripnest.backend.service.admin.impl;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.admin.AdminDashboardDto;
import com.tripnest.backend.dto.admin.AdminTripResponseDto;
import com.tripnest.backend.dto.admin.AdminUserResponseDto;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.enums.TripStatus;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.BudgetRepository;
import com.tripnest.backend.repository.DocumentRepository;
import com.tripnest.backend.repository.ExpenseRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.admin.AdminService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripnest.backend.dto.response.TripMemberResponse;
import com.tripnest.backend.entity.TripMember;
import com.tripnest.backend.repository.TripMemberRepository;
import com.tripnest.backend.entity.Destination;
import com.tripnest.backend.dto.admin.AdminAnalyticsResponse;
import com.tripnest.backend.entity.enums.ExpenseCategory;
import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.entity.Activity;
import com.tripnest.backend.service.TripService;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final DocumentRepository documentRepository;
    private final TripService tripService;
    private final TripMemberRepository tripMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AdminDashboardDto> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();

        List<Trip> trips = tripRepository.findAll();
        
        long activeTrips = trips.stream()
                .filter(t -> TripStatus.calculateStatus(t.getStartDate(), t.getEndDate(), t.getStatus()) == TripStatus.ACTIVE)
                .count();

        long upcomingTrips = trips.stream()
                .filter(t -> TripStatus.calculateStatus(t.getStartDate(), t.getEndDate(), t.getStatus()) == TripStatus.UPCOMING)
                .count();

        long completedTrips = trips.stream()
                .filter(t -> TripStatus.calculateStatus(t.getStartDate(), t.getEndDate(), t.getStatus()) == TripStatus.COMPLETED)
                .count();

        BigDecimal totalBudget = budgetRepository.sumTotalBudget();
        if (totalBudget == null) {
            totalBudget = BigDecimal.ZERO;
        }

        BigDecimal totalExpenses = expenseRepository.sumTotalExpenses();
        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }

        long totalDocuments = documentRepository.count();

        AdminDashboardDto dto = AdminDashboardDto.builder()
                .totalUsers(totalUsers)
                .totalTrips(totalTrips)
                .activeTrips(activeTrips)
                .upcomingTrips(upcomingTrips)
                .completedTrips(completedTrips)
                .totalBudget(totalBudget)
                .totalExpenses(totalExpenses)
                .totalDocuments(totalDocuments)
                .build();

        return ApiResponse.<AdminDashboardDto>builder()
                .success(true)
                .message("Admin statistics fetched successfully")
                .data(dto)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AdminUserResponseDto>> getAllUsers() {
        List<AdminUserResponseDto> users = userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());

        return ApiResponse.<List<AdminUserResponseDto>>builder()
                .success(true)
                .message("All users fetched successfully")
                .data(users)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AdminUserResponseDto> getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        return ApiResponse.<AdminUserResponseDto>builder()
                .success(true)
                .message("User details fetched successfully")
                .data(mapToUserDto(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AdminTripResponseDto>> getAllTrips() {
        List<AdminTripResponseDto> trips = tripRepository.findAll().stream()
                .map(this::mapToTripDto)
                .collect(Collectors.toList());

        return ApiResponse.<List<AdminTripResponseDto>>builder()
                .success(true)
                .message("All trips fetched successfully")
                .data(trips)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AdminTripResponseDto> getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));

        return ApiResponse.<AdminTripResponseDto>builder()
                .success(true)
                .message("Trip details fetched successfully")
                .data(mapToTripDto(trip))
                .build();
    }

    private AdminUserResponseDto mapToUserDto(User user) {
        return AdminUserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .phone(user.getPhone())
                .country(user.getCountry())
                .bio(user.getBio())
                .photo(user.getPhoto())
                .travelStyle(user.getTravelStyle())
                .emergencyContact(user.getEmergencyContact())
                .build();
    }

    private AdminTripResponseDto mapToTripDto(Trip trip) {
        BigDecimal budgetVal = BigDecimal.ZERO;
        if (trip.getBudget() != null && trip.getBudget().getTotalBudget() != null) {
            budgetVal = trip.getBudget().getTotalBudget();
        }

        String ownerName = "Unknown";
        String ownerEmail = "Unknown";
        if (trip.getUser() != null) {
            ownerName = trip.getUser().getFullName();
            ownerEmail = trip.getUser().getEmail();
        }

        return AdminTripResponseDto.builder()
                .id(trip.getId())
                .tripName(trip.getTripName())
                .ownerName(ownerName)
                .ownerEmail(ownerEmail)
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .status(TripStatus.calculateStatus(trip.getStartDate(), trip.getEndDate(), trip.getStatus()))
                .budget(budgetVal)
                .createdAt(trip.getCreatedAt())
                .totalMembers(trip.getTotalMembers())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AdminAnalyticsResponse> getAnalyticsOverview() {
        List<Trip> trips = tripRepository.findAll();
        tripService.syncTripStatuses(trips);

        long totalTrips = trips.size();
        long activeTrips = 0;
        long upcomingTrips = 0;
        long completedTrips = 0;

        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal remainingBudget = BigDecimal.ZERO;
        BigDecimal totalEstimatedItineraryCost = BigDecimal.ZERO;

        Map<String, BigDecimal> expenseCategoryDistribution = new HashMap<>();
        for (ExpenseCategory category : ExpenseCategory.values()) {
            expenseCategoryDistribution.put(category.name(), BigDecimal.ZERO);
        }

        Map<String, Long> tripStatusDistribution = new HashMap<>();
        tripStatusDistribution.put("ACTIVE", 0L);
        tripStatusDistribution.put("UPCOMING", 0L);
        tripStatusDistribution.put("COMPLETED", 0L);
        tripStatusDistribution.put("CANCELLED", 0L);

        Map<String, Long> destinationDistribution = new HashMap<>();

        for (Trip trip : trips) {
            TripStatus dynamicStatus = TripStatus.calculateStatus(trip.getStartDate(), trip.getEndDate(), trip.getStatus());
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

            if (trip.getDestinations() != null) {
                for (Destination dest : trip.getDestinations()) {
                    if (dest.getName() != null && !dest.getName().trim().isEmpty()) {
                        String destName = dest.getName().trim();
                        destinationDistribution.put(destName, destinationDistribution.getOrDefault(destName, 0L) + 1);
                    }
                }
            }

            if (trip.getBudget() != null) {
                BigDecimal budgetVal = trip.getBudget().getTotalBudget() != null ? trip.getBudget().getTotalBudget() : BigDecimal.ZERO;
                BigDecimal spentVal = trip.getBudget().getTotalSpent() != null ? trip.getBudget().getTotalSpent() : BigDecimal.ZERO;
                BigDecimal remainingVal = trip.getBudget().getRemainingBudget() != null ? trip.getBudget().getRemainingBudget() : BigDecimal.ZERO;

                totalBudget = totalBudget.add(budgetVal);
                totalSpent = totalSpent.add(spentVal);
                remainingBudget = remainingBudget.add(remainingVal);

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

            if (trip.getItineraries() != null) {
                for (Itinerary itinerary : trip.getItineraries()) {
                    if (itinerary.getActivities() != null) {
                        for (Activity activity : itinerary.getActivities()) {
                            if (activity.getCost() != null) {
                                totalEstimatedItineraryCost = totalEstimatedItineraryCost.add(activity.getCost());
                            }
                        }
                    }
                }
            }
        }

        double budgetUtilization = 0.0;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            budgetUtilization = totalSpent.doubleValue() / totalBudget.doubleValue() * 100.0;
            if (budgetUtilization > 100.0) {
                budgetUtilization = 100.0;
            } else if (budgetUtilization < 0.0) {
                budgetUtilization = 0.0;
            }
        }

        long totalUsers = userRepository.count();

        AdminAnalyticsResponse response = AdminAnalyticsResponse.builder()
                .totalTrips(totalTrips)
                .activeTrips(activeTrips)
                .upcomingTrips(upcomingTrips)
                .completedTrips(completedTrips)
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .remainingBudget(remainingBudget)
                .budgetUtilizationPercentage(budgetUtilization)
                .totalEstimatedItineraryCost(totalEstimatedItineraryCost)
                .expenseCategoryDistribution(expenseCategoryDistribution)
                .tripStatusDistribution(tripStatusDistribution)
                .totalUsers(totalUsers)
                .destinationDistribution(destinationDistribution)
                .build();

        return ApiResponse.<AdminAnalyticsResponse>builder()
                .success(true)
                .message("Admin analytics overview fetched successfully")
                .data(response)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<TripMemberResponse>> getTripMembers(Long tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new ResourceNotFoundException("Trip not found");
        }

        List<TripMemberResponse> members = tripMemberRepository.findByTripId(tripId)
                .stream()
                .map(member -> TripMemberResponse.builder()
                        .id(member.getId())
                        .name(member.getName())
                        .email(member.getEmail())
                        .role(member.getRole())
                        .status(member.getStatus())
                        .tripId(member.getTrip() != null ? member.getTrip().getId() : null)
                        .tripName(member.getTrip() != null ? member.getTrip().getTripName() : "")
                        .createdAt(member.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.<List<TripMemberResponse>>builder()
                .success(true)
                .message("Trip members retrieved successfully for admin")
                .data(members)
                .build();
    }
}
