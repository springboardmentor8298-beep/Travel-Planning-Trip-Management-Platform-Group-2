package com.tripnest.service;

import com.tripnest.dto.AnalyticsResponse;
import com.tripnest.entity.Expense;
import com.tripnest.entity.ExpenseCategory;
import com.tripnest.entity.MemberStatus;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripMemberRepository tripMemberRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User testUser;
    private Trip testTrip;
    private Expense testExpense;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);

        testTrip = new Trip();
        testTrip.setId(10L);
        testTrip.setTitle("Goa Beach Fun");
        testTrip.setDestination("Goa");
        testTrip.setBudget(BigDecimal.valueOf(1000.0));
        testTrip.setUser(testUser);

        testExpense = new Expense();
        testExpense.setId(100L);
        testExpense.setCategory(ExpenseCategory.TRANSPORTATION);
        testExpense.setAmount(BigDecimal.valueOf(250.0));
        testExpense.setExpenseDate(LocalDate.of(2026, 8, 15));
        testExpense.setTrip(testTrip);
    }

    @Test
    void testGetTravelerAnalytics_CalculatesCorrectAggregates() {
        when(tripRepository.findByUserIdOrderByStartDateDesc(1L)).thenReturn(List.of(testTrip));
        when(tripMemberRepository.findByUserIdAndStatus(1L, MemberStatus.ACCEPTED)).thenReturn(List.of());
        when(expenseRepository.findByTripIdOrderByExpenseDateDesc(10L)).thenReturn(List.of(testExpense));

        AnalyticsResponse response = analyticsService.getTravelerAnalytics(1L);

        assertNotNull(response);
        assertEquals(1, response.getTotalTrips());
        assertEquals(1000.0, response.getTotalBudgetAllocated());
        assertEquals(250.0, response.getTotalSpentAllTrips());
        assertTrue(response.getCategoryExpenses().containsKey("TRANSPORTATION"));
        assertEquals(250.0, response.getCategoryExpenses().get("TRANSPORTATION"));
    }
}
