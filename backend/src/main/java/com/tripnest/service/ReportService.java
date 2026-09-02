package com.tripnest.service;

import com.tripnest.dto.ReportFilterRequest;
import com.tripnest.dto.ReportResponseDTO;
import com.tripnest.entity.*;
import com.tripnest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    public ReportResponseDTO generateReports(String userEmail, ReportFilterRequest filter) {
        List<Trip> allTrips;
        if (userEmail != null && !userEmail.isBlank()) {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                allTrips = tripRepository.findAllUserAndSharedTrips(userOpt.get().getUserId());
            } else {
                allTrips = Collections.emptyList();
            }
        } else {
            allTrips = tripRepository.findAll();
        }

        // Apply Trip Filter
        if (filter != null && filter.getTripId() != null) {
            allTrips = allTrips.stream()
                    .filter(t -> t.getTripId().equals(filter.getTripId()))
                    .collect(Collectors.toList());
        }

        // Apply Status Filter
        if (filter != null && filter.getStatus() != null && !filter.getStatus().equalsIgnoreCase("ALL")) {
            allTrips = allTrips.stream()
                    .filter(t -> t.getStatus() != null && t.getStatus().equalsIgnoreCase(filter.getStatus()))
                    .collect(Collectors.toList());
        }

        // Apply Date Range Filter on Trips
        if (filter != null && filter.getStartDate() != null) {
            allTrips = allTrips.stream()
                    .filter(t -> t.getStartDate() == null || !t.getStartDate().isBefore(filter.getStartDate()))
                    .collect(Collectors.toList());
        }
        if (filter != null && filter.getEndDate() != null) {
            allTrips = allTrips.stream()
                    .filter(t -> t.getEndDate() == null || !t.getEndDate().isAfter(filter.getEndDate()))
                    .collect(Collectors.toList());
        }

        ReportResponseDTO report = new ReportResponseDTO();

        List<ReportResponseDTO.TripSummaryItem> tripSummaryList = new ArrayList<>();
        List<ReportResponseDTO.BudgetSummaryItem> budgetSummaryList = new ArrayList<>();
        List<ReportResponseDTO.ExpenseSummaryItem> expenseSummaryList = new ArrayList<>();
        List<ReportResponseDTO.ActivitySummaryItem> activitySummaryList = new ArrayList<>();

        Map<String, Long> statusCounts = new HashMap<>();

        for (Trip trip : allTrips) {
            // Count status
            String st = trip.getStatus() != null ? trip.getStatus().toUpperCase() : "UPCOMING";
            statusCounts.put(st, statusCounts.getOrDefault(st, 0L) + 1);

            // Budget
            Optional<Budget> bOpt = budgetRepository.findByTrip_TripId(trip.getTripId());
            BigDecimal tripBudget = BigDecimal.ZERO;
            if (bOpt.isPresent() && bOpt.get().getTotalBudget() != null) {
                tripBudget = bOpt.get().getTotalBudget();
            } else if (trip.getBudgetAllocated() != null) {
                tripBudget = trip.getBudgetAllocated();
            }

            // Expenses
            List<Expense> expenses = expenseRepository.findByBudget_Trip_TripId(trip.getTripId());
            BigDecimal tripSpent = BigDecimal.ZERO;

            for (Expense exp : expenses) {
                // Check category filter
                if (filter != null && filter.getCategory() != null && !filter.getCategory().equalsIgnoreCase("ALL")) {
                    if (exp.getCategory() == null || !exp.getCategory().equalsIgnoreCase(filter.getCategory())) {
                        continue;
                    }
                }

                // Check expense date filter
                if (filter != null && filter.getStartDate() != null && exp.getExpenseDate() != null) {
                    if (exp.getExpenseDate().isBefore(filter.getStartDate())) {
                        continue;
                    }
                }
                if (filter != null && filter.getEndDate() != null && exp.getExpenseDate() != null) {
                    if (exp.getExpenseDate().isAfter(filter.getEndDate())) {
                        continue;
                    }
                }

                BigDecimal amt = exp.getAmount() != null ? exp.getAmount() : BigDecimal.ZERO;
                tripSpent = tripSpent.add(amt);

                ReportResponseDTO.ExpenseSummaryItem expItem = new ReportResponseDTO.ExpenseSummaryItem();
                expItem.setExpenseId(exp.getExpenseId());
                expItem.setTripId(trip.getTripId());
                expItem.setTripName(trip.getTripName());
                expItem.setCategory(exp.getCategory() != null ? exp.getCategory() : "Other");
                expItem.setTitle(exp.getExpenseTitle() != null ? exp.getExpenseTitle() : "Expense #" + exp.getExpenseId());
                expItem.setAmount(amt);
                expItem.setDate(exp.getExpenseDate());
                expItem.setNotes(exp.getNotes());
                expenseSummaryList.add(expItem);
            }

            BigDecimal remaining = tripBudget.subtract(tripSpent);
            double utilization = 0.0;
            if (tripBudget.compareTo(BigDecimal.ZERO) > 0) {
                utilization = tripSpent.divide(tripBudget, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            }

            // Activities count
            List<Activity> activities = activityRepository.findByItinerary_Trip_TripId(trip.getTripId());
            for (Activity act : activities) {
                ReportResponseDTO.ActivitySummaryItem actItem = new ReportResponseDTO.ActivitySummaryItem();
                actItem.setActivityId(act.getActivityId());
                actItem.setTripId(trip.getTripId());
                actItem.setTripName(trip.getTripName());
                actItem.setActivityName(act.getActivityName());
                actItem.setLocation(act.getPlaceName());
                actItem.setTime(act.getActivityTime());
                actItem.setCost(act.getEstimatedCost() != null ? act.getEstimatedCost() : BigDecimal.ZERO);
                activitySummaryList.add(actItem);
            }

            // Trip summary item
            ReportResponseDTO.TripSummaryItem tItem = new ReportResponseDTO.TripSummaryItem();
            tItem.setTripId(trip.getTripId());
            tItem.setTripName(trip.getTripName());
            tItem.setDestination(trip.getDestination() != null ? trip.getDestination().getDestinationName() : "Custom Trip");
            tItem.setStartDate(trip.getStartDate());
            tItem.setEndDate(trip.getEndDate());
            tItem.setStatus(trip.getStatus());
            tItem.setNumberOfTravelers(trip.getNumberOfTravelers() != null ? trip.getNumberOfTravelers() : 1);
            tItem.setBudgetAllocated(tripBudget);
            tItem.setTotalExpenses(tripSpent);
            tItem.setRemainingBudget(remaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remaining);
            tItem.setActivityCount(activities.size());
            tripSummaryList.add(tItem);

            // Budget summary item
            ReportResponseDTO.BudgetSummaryItem bItem = new ReportResponseDTO.BudgetSummaryItem();
            bItem.setTripId(trip.getTripId());
            bItem.setTripName(trip.getTripName());
            bItem.setTotalBudget(tripBudget);
            bItem.setTotalSpent(tripSpent);
            bItem.setRemainingBudget(remaining);
            bItem.setUtilizationPercentage(Math.round(utilization * 100.0) / 100.0);

            if (utilization > 100.0) {
                bItem.setHealthStatus("OVER_BUDGET");
            } else if (utilization >= 80.0) {
                bItem.setHealthStatus("WARNING");
            } else {
                bItem.setHealthStatus("ON_TRACK");
            }
            budgetSummaryList.add(bItem);
        }

        // Status Summary Items
        long totalTripsCount = allTrips.size();
        List<ReportResponseDTO.TripStatusSummaryItem> statusSummaryList = statusCounts.entrySet().stream()
                .map(e -> {
                    double pct = totalTripsCount > 0 ? ((double) e.getValue() / totalTripsCount) * 100.0 : 0.0;
                    return new ReportResponseDTO.TripStatusSummaryItem(e.getKey(), e.getValue(), Math.round(pct * 10.0) / 10.0);
                })
                .collect(Collectors.toList());

        report.setTripSummary(tripSummaryList);
        report.setBudgetSummary(budgetSummaryList);
        report.setExpenseSummary(expenseSummaryList);
        report.setStatusSummary(statusSummaryList);
        report.setActivitySummary(activitySummaryList);

        return report;
    }
}
