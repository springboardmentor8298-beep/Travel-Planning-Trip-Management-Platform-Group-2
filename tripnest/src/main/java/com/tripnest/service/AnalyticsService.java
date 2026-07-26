package com.tripnest.service;

import com.tripnest.entity.Expense;
import com.tripnest.entity.ExpenseCategory;
import com.tripnest.entity.TripStatus;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AnalyticsService {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;

    public Map<String, Object> getUserAnalytics(Long userId) {
        Map<String, Object> analytics = new HashMap<>();

        // Trip statistics
        long totalTrips = tripRepository.countByUserId(userId);
        long completedTrips = tripRepository.countByUserIdAndStatus(userId, TripStatus.COMPLETED);
        long plannedTrips = tripRepository.countByUserIdAndStatus(userId, TripStatus.PLANNED);
        long ongoingTrips = tripRepository.countByUserIdAndStatus(userId, TripStatus.ONGOING);

        analytics.put("totalTrips", totalTrips);
        analytics.put("completedTrips", completedTrips);
        analytics.put("plannedTrips", plannedTrips);
        analytics.put("ongoingTrips", ongoingTrips);

        // Expense statistics
        List<com.tripnest.entity.Trip> userTrips = tripRepository.findByUserIdOrderByStartDateDesc(userId);
        BigDecimal totalExpenses = BigDecimal.ZERO;
        Map<ExpenseCategory, BigDecimal> expensesByCategory = new HashMap<>();

        for (com.tripnest.entity.Trip trip : userTrips) {
            BigDecimal tripExpenses = expenseRepository.getTotalExpensesByTripId(trip.getId());
            if (tripExpenses != null) {
                totalExpenses = totalExpenses.add(tripExpenses);
            }

            List<Object[]> tripCategoryExpenses = expenseRepository.getExpensesByCategoryForTrip(trip.getId());
            for (Object[] row : tripCategoryExpenses) {
                ExpenseCategory category = (ExpenseCategory) row[0];
                BigDecimal amount = (BigDecimal) row[1];
                expensesByCategory.merge(category, amount, BigDecimal::add);
            }
        }

        analytics.put("totalExpenses", totalExpenses);
        analytics.put("expensesByCategory", expensesByCategory);

        // Monthly expenses for current year
        Map<String, BigDecimal> monthlyExpenses = new HashMap<>();
        int currentYear = LocalDate.now().getYear();
        for (int month = 1; month <= 12; month++) {
            YearMonth yearMonth = YearMonth.of(currentYear, month);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();

            BigDecimal monthTotal = BigDecimal.ZERO;
            for (com.tripnest.entity.Trip trip : userTrips) {
                List<Expense> monthExpenses = expenseRepository.findByTripIdAndDateRange(trip.getId(), startDate, endDate);
                for (Expense expense : monthExpenses) {
                    monthTotal = monthTotal.add(expense.getAmount());
                }
            }
            monthlyExpenses.put(yearMonth.getMonth().name(), monthTotal);
        }
        analytics.put("monthlyExpenses", monthlyExpenses);

        // Top destinations
        Map<String, Long> destinationCounts = new HashMap<>();
        for (com.tripnest.entity.Trip trip : userTrips) {
            destinationCounts.merge(trip.getDestination(), 1L, Long::sum);
        }
        analytics.put("topDestinations", destinationCounts);

        return analytics;
    }

    public Map<String, Object> getTripAnalytics(Long tripId) {
        Map<String, Object> analytics = new HashMap<>();

        BigDecimal totalExpenses = expenseRepository.getTotalExpensesByTripId(tripId);
        analytics.put("totalExpenses", totalExpenses != null ? totalExpenses : BigDecimal.ZERO);

        List<Object[]> expensesByCategoryData = expenseRepository.getExpensesByCategoryForTrip(tripId);
        Map<ExpenseCategory, BigDecimal> expensesByCategory = new HashMap<>();
        for (Object[] row : expensesByCategoryData) {
            ExpenseCategory category = (ExpenseCategory) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            expensesByCategory.put(category, amount);
        }
        analytics.put("expensesByCategory", expensesByCategory);

        return analytics;
    }
}
