package com.tripnest.service;

import com.tripnest.dto.AnalyticsResponse;
import com.tripnest.entity.Expense;
import com.tripnest.entity.MemberStatus;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TripMember;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;
    private final ExpenseRepository expenseRepository;

    public AnalyticsResponse getTravelerAnalytics(Long userId) {
        // Fetch owned trips
        List<Trip> ownedTrips = tripRepository.findByUserIdOrderByStartDateDesc(userId);

        // Fetch accepted member trips
        List<TripMember> acceptedMemberships = tripMemberRepository.findByUserIdAndStatus(userId, MemberStatus.ACCEPTED);
        List<Trip> memberTrips = acceptedMemberships.stream().map(TripMember::getTrip).toList();

        // Combine all accessible trips uniquely
        Map<Long, Trip> tripMap = new LinkedHashMap<>();
        ownedTrips.forEach(t -> tripMap.put(t.getId(), t));
        memberTrips.forEach(t -> tripMap.put(t.getId(), t));
        List<Trip> allTrips = new ArrayList<>(tripMap.values());

        double totalBudgetAllocated = 0.0;
        double totalSpentAllTrips = 0.0;
        Map<String, Double> categoryExpenses = new LinkedHashMap<>();
        Map<String, Double> monthlyExpenses = new TreeMap<>();
        Map<String, Long> destinationCounts = new HashMap<>();
        List<AnalyticsResponse.TripBudgetComparison> comparisons = new ArrayList<>();

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Trip trip : allTrips) {
            double budget = trip.getBudget() != null ? trip.getBudget().doubleValue() : 0.0;
            totalBudgetAllocated += budget;

            // Track destinations
            if (trip.getDestination() != null) {
                destinationCounts.put(trip.getDestination(),
                        destinationCounts.getOrDefault(trip.getDestination(), 0L) + 1);
            }

            // Fetch expenses for trip
            List<Expense> expenses = expenseRepository.findByTripIdOrderByExpenseDateDesc(trip.getId());
            double tripTotalSpent = 0.0;

            for (Expense expense : expenses) {
                double amount = expense.getAmount() != null ? expense.getAmount().doubleValue() : 0.0;
                tripTotalSpent += amount;
                totalSpentAllTrips += amount;

                // Category breakdown
                String category = expense.getCategory() != null ? expense.getCategory().name() : "MISCELLANEOUS";
                categoryExpenses.put(category, categoryExpenses.getOrDefault(category, 0.0) + amount);

                // Monthly breakdown
                if (expense.getExpenseDate() != null) {
                    String monthKey = expense.getExpenseDate().format(monthFormatter);
                    monthlyExpenses.put(monthKey, monthlyExpenses.getOrDefault(monthKey, 0.0) + amount);
                }
            }

            comparisons.add(new AnalyticsResponse.TripBudgetComparison(
                    trip.getId(),
                    trip.getTitle(),
                    budget,
                    tripTotalSpent
            ));
        }

        return AnalyticsResponse.builder()
                .totalSpentAllTrips(totalSpentAllTrips)
                .totalBudgetAllocated(totalBudgetAllocated)
                .totalTrips(allTrips.size())
                .categoryExpenses(categoryExpenses)
                .monthlyExpenses(monthlyExpenses)
                .tripComparisons(comparisons)
                .topDestinations(destinationCounts)
                .build();
    }
}
