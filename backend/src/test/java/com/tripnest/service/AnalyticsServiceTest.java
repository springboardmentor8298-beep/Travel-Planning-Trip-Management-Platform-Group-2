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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User testUser;
    private Trip trip1;
    private Trip trip2;
    private Budget budget1;
    private Budget budget2;
    private Expense expense1;
    private Expense expense2;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1);
        testUser.setEmail("traveler@tripnest.com");

        trip1 = new Trip();
        trip1.setTripId(101);
        trip1.setTripName("Paris Summer Vacation");
        trip1.setStatus("UPCOMING");
        trip1.setBudgetAllocated(new BigDecimal("3000.00"));
        trip1.setUser(testUser);

        trip2 = new Trip();
        trip2.setTripId(102);
        trip2.setTripName("Tokyo Exploration");
        trip2.setStatus("COMPLETED");
        trip2.setBudgetAllocated(new BigDecimal("5000.00"));
        trip2.setUser(testUser);

        budget1 = new Budget();
        budget1.setBudgetId(201);
        budget1.setTrip(trip1);
        budget1.setTotalBudget(new BigDecimal("3000.00"));

        budget2 = new Budget();
        budget2.setBudgetId(202);
        budget2.setTrip(trip2);
        budget2.setTotalBudget(new BigDecimal("5000.00"));

        expense1 = new Expense();
        expense1.setExpenseId(301);
        expense1.setBudget(budget1);
        expense1.setCategory("Accommodation");
        expense1.setAmount(new BigDecimal("1200.00"));
        expense1.setExpenseDate(LocalDate.now());

        expense2 = new Expense();
        expense2.setExpenseId(302);
        expense2.setBudget(budget1);
        expense2.setCategory("Food");
        expense2.setAmount(new BigDecimal("600.00"));
        expense2.setExpenseDate(LocalDate.now());
    }

    @Test
    void testGetUserAnalytics_Success() {
        when(userRepository.findByEmail("traveler@tripnest.com")).thenReturn(Optional.of(testUser));
        when(tripRepository.findAllUserAndSharedTrips(1)).thenReturn(Arrays.asList(trip1, trip2));

        when(budgetRepository.findByTrip_TripId(101)).thenReturn(Optional.of(budget1));
        when(budgetRepository.findByTrip_TripId(102)).thenReturn(Optional.of(budget2));

        when(expenseRepository.findByBudget_Trip_TripId(101)).thenReturn(Arrays.asList(expense1, expense2));
        when(expenseRepository.findByBudget_Trip_TripId(102)).thenReturn(Collections.emptyList());

        AnalyticsDTO result = analyticsService.getUserAnalytics("traveler@tripnest.com");

        assertNotNull(result);
        assertEquals(2, result.getTotalTrips());
        assertEquals(1, result.getUpcomingTrips());
        assertEquals(1, result.getCompletedTrips());
        assertEquals(0, result.getCancelledTrips());

        // Total Budget: 3000 + 5000 = 8000
        assertEquals(new BigDecimal("8000.00"), result.getTotalBudget());

        // Total Expenses: 1200 + 600 = 1800
        assertEquals(new BigDecimal("1800.00"), result.getTotalExpenses());

        // Remaining: 8000 - 1800 = 6200
        assertEquals(new BigDecimal("6200.00"), result.getRemainingBudget());

        // Utilization: (1800 / 8000) * 100 = 22.5%
        assertEquals(22.5, result.getBudgetUtilization());

        // Expense by Category
        assertEquals(new BigDecimal("1200.00"), result.getExpenseByCategory().get("Accommodation"));
        assertEquals(new BigDecimal("600.00"), result.getExpenseByCategory().get("Food"));
        assertEquals(BigDecimal.ZERO, result.getExpenseByCategory().get("Transportation"));

        // Status Distribution
        assertEquals(1L, result.getTripStatusDistribution().get("UPCOMING"));
        assertEquals(1L, result.getTripStatusDistribution().get("COMPLETED"));
    }

    @Test
    void testGetUserAnalytics_EmptyState() {
        when(userRepository.findByEmail("newbie@tripnest.com")).thenReturn(Optional.empty());

        AnalyticsDTO result = analyticsService.getUserAnalytics("newbie@tripnest.com");

        assertNotNull(result);
        assertEquals(0, result.getTotalTrips());
        assertEquals(BigDecimal.ZERO, result.getTotalBudget());
        assertEquals(BigDecimal.ZERO, result.getTotalExpenses());
        assertEquals(BigDecimal.ZERO, result.getRemainingBudget());
        assertEquals(0.0, result.getBudgetUtilization());
    }
}
