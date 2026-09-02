package com.tripnest.service;

import com.tripnest.dto.AnalyticsDTO;
import com.tripnest.entity.Budget;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    public AnalyticsDTO getUserAnalytics(String userEmail) {
        List<Trip> trips;
        if (userEmail != null && !userEmail.isBlank()) {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                trips = tripRepository.findAllUserAndSharedTrips(userOpt.get().getUserId());
            } else {
                trips = Collections.emptyList();
            }
        } else {
            trips = tripRepository.findAll();
        }

        AnalyticsDTO dto = new AnalyticsDTO();

        long totalTrips = trips.size();
        long upcoming = 0;
        long completed = 0;
        long cancelled = 0;
        long planning = 0;

        Map<String, Long> statusDist = new LinkedHashMap<>();
        statusDist.put("UPCOMING", 0L);
        statusDist.put("COMPLETED", 0L);
        statusDist.put("CANCELLED", 0L);
        statusDist.put("PLANNING", 0L);

        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();
        String[] categories = {"Accommodation", "Transportation", "Food", "Activities", "Shopping", "Other"};
        for (String cat : categories) {
            expenseByCategory.put(cat, BigDecimal.ZERO);
        }

        List<AnalyticsDTO.TripBudgetComparisonDTO> comparisonList = new ArrayList<>();
        Map<String, BigDecimal> monthlySpendingMap = new LinkedHashMap<>();

        for (Trip trip : trips) {
            String status = trip.getStatus() != null ? trip.getStatus().toUpperCase() : "UPCOMING";
            if ("UPCOMING".equals(status) || "ACTIVE".equals(status)) {
                upcoming++;
            } else if ("COMPLETED".equals(status)) {
                completed++;
            } else if ("CANCELLED".equals(status)) {
                cancelled++;
            } else {
                planning++;
            }
            statusDist.put(status, statusDist.getOrDefault(status, 0L) + 1);

            // Budget calculation
            Optional<Budget> budgetOpt = budgetRepository.findByTrip_TripId(trip.getTripId());
            BigDecimal tripBudget = BigDecimal.ZERO;
            if (budgetOpt.isPresent() && budgetOpt.get().getTotalBudget() != null) {
                tripBudget = budgetOpt.get().getTotalBudget();
            } else if (trip.getBudgetAllocated() != null) {
                tripBudget = trip.getBudgetAllocated();
            }
            totalBudget = totalBudget.add(tripBudget);

            // Expenses for this trip
            List<Expense> tripExpenses = expenseRepository.findByBudget_Trip_TripId(trip.getTripId());
            BigDecimal tripSpent = BigDecimal.ZERO;

            for (Expense exp : tripExpenses) {
                BigDecimal amt = exp.getAmount() != null ? exp.getAmount() : BigDecimal.ZERO;
                tripSpent = tripSpent.add(amt);
                totalExpenses = totalExpenses.add(amt);

                // Category distribution
                String cat = exp.getCategory() != null ? exp.getCategory() : "Other";
                BigDecimal currentCatTotal = expenseByCategory.getOrDefault(cat, BigDecimal.ZERO);
                expenseByCategory.put(cat, currentCatTotal.add(amt));

                // Monthly trend
                if (exp.getExpenseDate() != null) {
                    String monthKey = exp.getExpenseDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                    monthlySpendingMap.put(monthKey, monthlySpendingMap.getOrDefault(monthKey, BigDecimal.ZERO).add(amt));
                }
            }

            comparisonList.add(new AnalyticsDTO.TripBudgetComparisonDTO(
                    trip.getTripId(),
                    trip.getTripName() != null ? trip.getTripName() : ("Trip #" + trip.getTripId()),
                    tripBudget,
                    tripSpent
            ));
        }

        BigDecimal remainingBudget = totalBudget.subtract(totalExpenses);
        if (remainingBudget.compareTo(BigDecimal.ZERO) < 0) {
            remainingBudget = BigDecimal.ZERO;
        }

        double utilization = 0.0;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            utilization = totalExpenses.divide(totalBudget, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        List<AnalyticsDTO.MonthlySpendingDTO> monthlyList = monthlySpendingMap.entrySet().stream()
                .map(e -> new AnalyticsDTO.MonthlySpendingDTO(e.getKey(), java.time.LocalDate.now().getYear(), e.getValue()))
                .collect(Collectors.toList());

        Map<String, Long> upcomingVsCompleted = new HashMap<>();
        upcomingVsCompleted.put("upcoming", upcoming);
        upcomingVsCompleted.put("completed", completed);

        dto.setTotalTrips(totalTrips);
        dto.setUpcomingTrips(upcoming);
        dto.setCompletedTrips(completed);
        dto.setCancelledTrips(cancelled);
        dto.setPlanningTrips(planning);
        dto.setTotalBudget(totalBudget);
        dto.setTotalExpenses(totalExpenses);
        dto.setRemainingBudget(remainingBudget);
        dto.setBudgetUtilization(Math.round(utilization * 100.0) / 100.0);
        dto.setExpenseByCategory(expenseByCategory);
        dto.setTripStatusDistribution(statusDist);
        dto.setBudgetVsExpense(comparisonList);
        dto.setMonthlySpending(monthlyList);
        dto.setUpcomingVsCompleted(upcomingVsCompleted);

        return dto;
    }
}
