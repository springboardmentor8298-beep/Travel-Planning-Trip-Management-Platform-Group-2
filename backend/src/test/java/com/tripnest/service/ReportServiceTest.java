package com.tripnest.service;

import com.tripnest.dto.ReportFilterRequest;
import com.tripnest.dto.ReportResponseDTO;
import com.tripnest.entity.Budget;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.*;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReportService reportService;

    private User user;
    private Trip trip;
    private Budget budget;
    private Expense expense;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(10);
        user.setEmail("analyst@tripnest.com");

        trip = new Trip();
        trip.setTripId(50);
        trip.setTripName("Rome Architecture Tour");
        trip.setStatus("UPCOMING");
        trip.setStartDate(LocalDate.of(2026, 9, 1));
        trip.setEndDate(LocalDate.of(2026, 9, 10));
        trip.setUser(user);
        trip.setNumberOfTravelers(2);
        trip.setBudgetAllocated(new BigDecimal("4000.00"));

        budget = new Budget();
        budget.setBudgetId(60);
        budget.setTrip(trip);
        budget.setTotalBudget(new BigDecimal("4000.00"));

        expense = new Expense();
        expense.setExpenseId(70);
        expense.setBudget(budget);
        expense.setCategory("Food");
        expense.setExpenseTitle("Authentic Trattoria Dinner");
        expense.setAmount(new BigDecimal("150.00"));
        expense.setExpenseDate(LocalDate.of(2026, 9, 2));
    }

    @Test
    void testGenerateReports_AllSummariesPopulated() {
        when(userRepository.findByEmail("analyst@tripnest.com")).thenReturn(Optional.of(user));
        when(tripRepository.findAllUserAndSharedTrips(10)).thenReturn(Collections.singletonList(trip));
        when(budgetRepository.findByTrip_TripId(50)).thenReturn(Optional.of(budget));
        when(expenseRepository.findByBudget_Trip_TripId(50)).thenReturn(Collections.singletonList(expense));
        when(activityRepository.findByItinerary_Trip_TripId(50)).thenReturn(Collections.emptyList());

        ReportFilterRequest filter = new ReportFilterRequest();

        ReportResponseDTO reports = reportService.generateReports("analyst@tripnest.com", filter);

        assertNotNull(reports);
        assertEquals(1, reports.getTripSummary().size());
        assertEquals("Rome Architecture Tour", reports.getTripSummary().get(0).getTripName());
        assertEquals(new BigDecimal("4000.00"), reports.getTripSummary().get(0).getBudgetAllocated());
        assertEquals(new BigDecimal("150.00"), reports.getTripSummary().get(0).getTotalExpenses());

        assertEquals(1, reports.getBudgetSummary().size());
        assertEquals("ON_TRACK", reports.getBudgetSummary().get(0).getHealthStatus());

        assertEquals(1, reports.getExpenseSummary().size());
        assertEquals("Authentic Trattoria Dinner", reports.getExpenseSummary().get(0).getTitle());
        assertEquals("Food", reports.getExpenseSummary().get(0).getCategory());

        assertEquals(1, reports.getStatusSummary().size());
        assertEquals("UPCOMING", reports.getStatusSummary().get(0).getStatus());
    }

    @Test
    void testGenerateReports_CategoryFilter() {
        when(userRepository.findByEmail("analyst@tripnest.com")).thenReturn(Optional.of(user));
        when(tripRepository.findAllUserAndSharedTrips(10)).thenReturn(Collections.singletonList(trip));
        when(budgetRepository.findByTrip_TripId(50)).thenReturn(Optional.of(budget));
        when(expenseRepository.findByBudget_Trip_TripId(50)).thenReturn(Collections.singletonList(expense));
        when(activityRepository.findByItinerary_Trip_TripId(50)).thenReturn(Collections.emptyList());

        // Filter for Accommodation should exclude Food expense
        ReportFilterRequest filter = new ReportFilterRequest();
        filter.setCategory("Accommodation");

        ReportResponseDTO reports = reportService.generateReports("analyst@tripnest.com", filter);

        assertNotNull(reports);
        assertEquals(0, reports.getExpenseSummary().size());
    }
}
