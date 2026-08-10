package com.tripnest.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.AnalyticsResponse;
import com.tripnest.backend.entity.Activity;
import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.enums.ExpenseCategory;
import com.tripnest.backend.entity.enums.TripStatus;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.impl.AnalyticsServiceImpl;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripService tripService;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    private User testUser;
    private SecurityContext originalSecurityContext;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@tripnest.com");
        testUser.setFullName("Test User");

        originalSecurityContext = SecurityContextHolder.getContext();
        
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("test@tripnest.com");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.setContext(originalSecurityContext);
    }

    @Test
    void testGetAnalytics_NoTrips() {
        when(userRepository.findByEmail("test@tripnest.com")).thenReturn(Optional.of(testUser));
        when(tripRepository.findAll(any(Specification.class))).thenReturn(Collections.emptyList());

        ApiResponse<AnalyticsResponse> response = analyticsService.getAnalyticsOverview();

        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        
        AnalyticsResponse metrics = response.getData();
        assertEquals(0L, metrics.getTotalTrips());
        assertEquals(0L, metrics.getActiveTrips());
        assertEquals(0L, metrics.getUpcomingTrips());
        assertEquals(0L, metrics.getCompletedTrips());
        assertEquals(BigDecimal.ZERO, metrics.getTotalBudget());
        assertEquals(BigDecimal.ZERO, metrics.getTotalSpent());
        assertEquals(BigDecimal.ZERO, metrics.getRemainingBudget());
        assertEquals(0.0, metrics.getBudgetUtilization());
        assertEquals(BigDecimal.ZERO, metrics.getEstimatedItineraryCost());
    }

    @Test
    void testGetAnalytics_MultipleTrips_ZeroBudget() {
        when(userRepository.findByEmail("test@tripnest.com")).thenReturn(Optional.of(testUser));

        List<Trip> mockTrips = new ArrayList<>();
        
        // Dynamic ACTIVE trip
        Trip trip1 = Trip.builder()
                .id(1L)
                .tripName("Trip 1")
                .startDate(LocalDate.now().minusDays(2))
                .endDate(LocalDate.now().plusDays(2))
                .status(TripStatus.ACTIVE)
                .user(testUser)
                .build();
        mockTrips.add(trip1);

        when(tripRepository.findAll(any(Specification.class))).thenReturn(mockTrips);

        ApiResponse<AnalyticsResponse> response = analyticsService.getAnalyticsOverview();

        assertTrue(response.isSuccess());
        AnalyticsResponse metrics = response.getData();
        assertEquals(1L, metrics.getTotalTrips());
        assertEquals(1L, metrics.getActiveTrips());
        assertEquals(0.0, metrics.getBudgetUtilization()); // Zero budget yields 0%
    }

    @Test
    void testGetAnalytics_SpentGreaterThanBudget() {
        when(userRepository.findByEmail("test@tripnest.com")).thenReturn(Optional.of(testUser));

        List<Trip> mockTrips = new ArrayList<>();
        
        Trip trip = Trip.builder()
                .id(1L)
                .tripName("Trip 1")
                .startDate(LocalDate.now().plusDays(5)) // Upcoming
                .endDate(LocalDate.now().plusDays(10))
                .status(TripStatus.PLANNED)
                .user(testUser)
                .build();

        Budget budget = Budget.builder()
                .id(1L)
                .totalBudget(new BigDecimal("100.00"))
                .totalSpent(new BigDecimal("150.00"))
                .remainingBudget(new BigDecimal("-50.00"))
                .trip(trip)
                .build();

        List<Expense> expenses = new ArrayList<>();
        expenses.add(Expense.builder()
                .amount(new BigDecimal("150.00"))
                .category(ExpenseCategory.TRANSPORTATION)
                .budget(budget)
                .build());
        budget.setExpenses(expenses);
        trip.setBudget(budget);

        mockTrips.add(trip);

        when(tripRepository.findAll(any(Specification.class))).thenReturn(mockTrips);

        ApiResponse<AnalyticsResponse> response = analyticsService.getAnalyticsOverview();

        assertTrue(response.isSuccess());
        AnalyticsResponse metrics = response.getData();
        assertEquals(1L, metrics.getTotalTrips());
        assertEquals(1L, metrics.getUpcomingTrips());
        assertEquals(100.0, metrics.getBudgetUtilization()); // Clamp spent > budget to 100%
        assertEquals(new BigDecimal("150.00"), metrics.getExpenseCategoryDistribution().get("TRANSPORTATION"));
    }

    @Test
    void testGetAnalytics_EstimatedItineraryCost() {
        when(userRepository.findByEmail("test@tripnest.com")).thenReturn(Optional.of(testUser));

        List<Trip> mockTrips = new ArrayList<>();
        
        Trip trip = Trip.builder()
                .id(1L)
                .tripName("Trip with Itinerary")
                .startDate(LocalDate.now().minusDays(10)) // Completed
                .endDate(LocalDate.now().minusDays(5))
                .status(TripStatus.COMPLETED)
                .user(testUser)
                .build();

        List<Itinerary> itineraries = new ArrayList<>();
        Itinerary it = Itinerary.builder().id(1L).trip(trip).build();
        List<Activity> activities = new ArrayList<>();
        activities.add(Activity.builder().cost(new BigDecimal("250.00")).itinerary(it).build());
        activities.add(Activity.builder().cost(new BigDecimal("150.00")).itinerary(it).build());
        it.setActivities(activities);
        itineraries.add(it);
        trip.setItineraries(itineraries);

        mockTrips.add(trip);

        when(tripRepository.findAll(any(Specification.class))).thenReturn(mockTrips);

        ApiResponse<AnalyticsResponse> response = analyticsService.getAnalyticsOverview();

        assertTrue(response.isSuccess());
        AnalyticsResponse metrics = response.getData();
        assertEquals(1L, metrics.getTotalTrips());
        assertEquals(1L, metrics.getCompletedTrips());
        assertEquals(new BigDecimal("400.00"), metrics.getEstimatedItineraryCost());
    }
}
