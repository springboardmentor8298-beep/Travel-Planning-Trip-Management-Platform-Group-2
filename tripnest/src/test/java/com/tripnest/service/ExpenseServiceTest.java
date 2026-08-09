package com.tripnest.service;

import com.tripnest.dto.BudgetSummaryResponse;
import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.entity.Expense;
import com.tripnest.entity.ExpenseCategory;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripMemberRepository;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripMemberRepository tripMemberRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private Trip testTrip;
    private User testUser;
    private Expense testExpense;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("alice");

        testTrip = new Trip();
        testTrip.setId(50L);
        testTrip.setTitle("Tokyo Excursion");
        testTrip.setBudget(BigDecimal.valueOf(2000.0));
        testTrip.setUser(testUser);

        testExpense = new Expense();
        testExpense.setId(10L);
        testExpense.setTrip(testTrip);
        testExpense.setCategory(ExpenseCategory.FOOD);
        testExpense.setAmount(BigDecimal.valueOf(150.0));
        testExpense.setDescription("Sushi Dinner");
        testExpense.setExpenseDate(LocalDate.now());
        testExpense.setUser(testUser);
    }

    @Test
    void testGetExpensesByTrip_Success() {
        when(tripRepository.findById(50L)).thenReturn(Optional.of(testTrip));
        when(expenseRepository.findByTripIdOrderByExpenseDateDesc(50L)).thenReturn(List.of(testExpense));

        List<ExpenseResponse> result = expenseService.getExpensesByTrip(50L, 1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Sushi Dinner", result.get(0).getDescription());
        assertEquals(BigDecimal.valueOf(150.0), result.get(0).getAmount());
    }

    @Test
    void testGetBudgetSummary_CalculatesRemainingAndCategoryTotals() {
        when(tripRepository.findById(50L)).thenReturn(Optional.of(testTrip));
        when(expenseRepository.sumAmountByTripId(50L)).thenReturn(BigDecimal.valueOf(150.0));
        when(expenseRepository.sumByCategory(50L)).thenReturn(Collections.emptyList());

        BudgetSummaryResponse summary = expenseService.getBudgetSummary(50L, 1L);

        assertNotNull(summary);
        assertEquals(BigDecimal.valueOf(2000.0), summary.getTotalBudget());
        assertEquals(BigDecimal.valueOf(150.0), summary.getTotalSpent());
        assertEquals(BigDecimal.valueOf(1850.0), summary.getRemaining());
        assertFalse(summary.isOverBudget());
    }

    @Test
    void testAddExpense_Success() {
        ExpenseRequest req = new ExpenseRequest();
        req.setCategory(ExpenseCategory.HOTEL);
        req.setAmount(BigDecimal.valueOf(500.0));
        req.setDescription("Shinjuku Hotel");
        req.setExpenseDate(LocalDate.now());

        when(tripRepository.findById(50L)).thenReturn(Optional.of(testTrip));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(inv -> {
            Expense e = inv.getArgument(0);
            e.setId(11L);
            return e;
        });

        ExpenseResponse created = expenseService.addExpense(50L, 1L, req);

        assertNotNull(created);
        assertEquals("Shinjuku Hotel", created.getDescription());
        assertEquals(BigDecimal.valueOf(500.0), created.getAmount());
    }
}
