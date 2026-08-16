package com.tripnest.service;

import com.tripnest.dto.DailyExpensePoint;
import com.tripnest.dto.DashboardStatsResponse;
import com.tripnest.dto.TripResponse;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TripStatus;
import com.tripnest.entity.User;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Aggregates data across ALL of a user's trips for the main Dashboard page -
 * separate from TripService, which deals with one trip at a time.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final TripMapper tripMapper;

    public DashboardStatsResponse getStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Trip> trips = tripRepository.findAllAccessibleByUser(user.getId());

        double totalBudget = trips.stream()
                .mapToDouble(t -> t.getBudget() != null ? t.getBudget() : 0.0)
                .sum();

        List<Expense> allExpenses = new ArrayList<>();
        for (Trip trip : trips) {
            allExpenses.addAll(expenseRepository.findByTripIdOrderByExpenseDateDesc(trip.getId()));
        }

        double totalExpenses = allExpenses.stream().mapToDouble(Expense::getAmount).sum();
        double averageTripCost = trips.isEmpty() ? 0.0 : totalBudget / trips.size();

        String mostVisited = trips.stream()
                .map(t -> {
                    if (t.getCity() != null && !t.getCity().isBlank()) {
                        return t.getState() != null ? t.getCity() + ", " + t.getState() : t.getCity();
                    }
                    return t.getDestination() != null ? t.getDestination().getName() : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(loc -> loc, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        for (TripStatus status : TripStatus.values()) {
            statusBreakdown.put(status.name(), trips.stream().filter(t -> t.getStatus() == status).count());
        }

        Map<String, Double> categoryBreakdown = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().name(),
                        Collectors.summingDouble(Expense::getAmount)
                ));

        String topExpenseCategory = categoryBreakdown.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        double budgetUtilizationPercent = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0.0;

        List<DailyExpensePoint> trend = buildLast7DayTrend(allExpenses);

        List<TripResponse> recentTrips = trips.stream()
                .sorted(Comparator.comparing(Trip::getCreatedAt).reversed())
                .limit(3)
                .map(tripMapper::toResponse)
                .toList();

        return new DashboardStatsResponse(
                trips.size(), round2(totalBudget), round2(totalExpenses), round2(averageTripCost),
                mostVisited, topExpenseCategory, round2(budgetUtilizationPercent),
                statusBreakdown, categoryBreakdown, trend, recentTrips
        );
    }

    private List<DailyExpensePoint> buildLast7DayTrend(List<Expense> allExpenses) {
        Map<LocalDate, Double> byDate = allExpenses.stream()
                .collect(Collectors.groupingBy(Expense::getExpenseDate, Collectors.summingDouble(Expense::getAmount)));

        List<DailyExpensePoint> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            trend.add(new DailyExpensePoint(day, round2(byDate.getOrDefault(day, 0.0))));
        }
        return trend;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
