package com.tripnest.service;

import com.tripnest.entity.Budget;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExpenseValidationTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ExpenseService expenseService;

    private Budget budget;
    private Trip trip;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1);
        user.setEmail("traveler@tripnest.com");

        trip = new Trip();
        trip.setTripId(10);
        trip.setTripName("Bali Escape");
        trip.setUser(user);

        budget = new Budget();
        budget.setBudgetId(20);
        budget.setTrip(trip);
        budget.setTotalBudget(new BigDecimal("1000.00"));
    }

    @Test
    void testSaveExpense_NegativeAmountThrowsException() {
        Expense expense = new Expense();
        expense.setAmount(new BigDecimal("-50.00"));
        expense.setBudget(budget);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            expenseService.saveExpense(expense);
        });

        assertEquals("Expense amount cannot be negative", ex.getMessage());
        verify(expenseRepository, never()).save(any(Expense.class));
    }

    @Test
    void testSaveExpense_MissingBudgetThrowsException() {
        Expense expense = new Expense();
        expense.setAmount(new BigDecimal("150.00"));
        expense.setBudget(null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            expenseService.saveExpense(expense);
        });

        assertEquals("Expense must be linked to a budget", ex.getMessage());
        verify(expenseRepository, never()).save(any(Expense.class));
    }

    @Test
    void testSaveExpense_SuccessAndThresholdAlertTriggered() {
        Expense expense = new Expense();
        expense.setExpenseId(1);
        expense.setAmount(new BigDecimal("850.00")); // 85% of $1000
        expense.setBudget(budget);
        expense.setCategory("Accommodation");
        expense.setExpenseDate(LocalDate.now());

        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);
        when(budgetRepository.findById(20)).thenReturn(Optional.of(budget));
        when(expenseRepository.findByBudget_BudgetId(20)).thenReturn(Collections.singletonList(expense));

        Expense saved = expenseService.saveExpense(expense);

        assertNotNull(saved);
        assertEquals(new BigDecimal("850.00"), saved.getAmount());
        // Remaining budget should now be 150
        assertEquals(new BigDecimal("150.00"), budget.getRemainingBudget());
        // Verify threshold notification was triggered
        verify(notificationService, times(1)).saveNotification(any());
    }
}
