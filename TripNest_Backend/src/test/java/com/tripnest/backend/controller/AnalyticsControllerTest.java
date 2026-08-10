package com.tripnest.backend.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.HashMap;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.AnalyticsResponse;
import com.tripnest.backend.service.AnalyticsService;

@SpringBootTest
@AutoConfigureMockMvc
public class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    @Test
    @WithMockUser(username = "test@tripnest.com")
    void testGetAnalyticsOverview_Success() throws Exception {
        AnalyticsResponse mockResponse = AnalyticsResponse.builder()
                .totalTrips(5L)
                .activeTrips(2L)
                .upcomingTrips(2L)
                .completedTrips(1L)
                .totalBudget(new BigDecimal("10000.00"))
                .totalSpent(new BigDecimal("4500.00"))
                .remainingBudget(new BigDecimal("5500.00"))
                .budgetUtilization(45.0)
                .estimatedItineraryCost(new BigDecimal("4200.00"))
                .expenseCategoryDistribution(new HashMap<>())
                .tripStatusDistribution(new HashMap<>())
                .build();

        when(analyticsService.getAnalyticsOverview()).thenReturn(ApiResponse.success(mockResponse));

        mockMvc.perform(get("/api/analytics/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalTrips").value(5))
                .andExpect(jsonPath("$.data.activeTrips").value(2))
                .andExpect(jsonPath("$.data.budgetUtilization").value(45.0))
                .andExpect(jsonPath("$.data.estimatedItineraryCost").value(4200.00));
    }

    @Test
    void testGetAnalyticsOverview_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/analytics/overview"))
                .andExpect(status().isForbidden());
    }
}
