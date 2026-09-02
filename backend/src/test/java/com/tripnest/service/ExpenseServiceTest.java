package com.tripnest.service;

import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.Expense;
import com.tripnest.model.Role;
import com.tripnest.model.Trip;
import com.tripnest.model.TripStatus;
import com.tripnest.model.User;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExpenseService Unit Tests")
class ExpenseServiceTest {

    @Mock ExpenseRepository  expenseRepository;
    @Mock UserRepository     userRepository;
    @Mock TripAccessService  tripAccessService;

    @InjectMocks ExpenseService expenseService;

    private User    owner;
    private Trip    trip;
    private Expense expense;
    private ExpenseRequest expenseRequest;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setEmail("alice@example.com");
        owner.setFullName("Alice");
        owner.setRole(Role.TRAVELER);
        owner.setPassword("enc");

        trip = new Trip();
        trip.setId(10L);
        trip.setTitle("Goa Trip");
        trip.setDestination("Goa");
        trip.setStartDate(LocalDate.of(2025, 12, 1));
        trip.setEndDate(LocalDate.of(2025, 12, 7));
        trip.setBudget(new BigDecimal("20000"));
        trip.setStatus(TripStatus.PLANNED);
        trip.setOwner(owner);

        // Expense with paidBy set (required by ExpenseResponse.fromEntity)
        expense = buildExpense("Hotel Stay", "5000", "Stay");

        expenseRequest = new ExpenseRequest();
        expenseRequest.setTitle("Hotel Stay");
        expenseRequest.setAmount(new BigDecimal("5000"));
        expenseRequest.setCategory("Stay");
        expenseRequest.setExpenseDate(LocalDate.of(2025, 12, 2));
    }

    /* ── Add expense ── */

    @Test
    @DisplayName("addExpense: should save and return ExpenseResponse")
    void addExpense_success() {
        when(tripAccessService.findAccessibleTrip("alice@example.com", 10L)).thenReturn(trip);
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(owner));
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);

        ExpenseResponse response = expenseService.addExpense("alice@example.com", 10L, expenseRequest);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Hotel Stay");
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("5000"));
        assertThat(response.getCategory()).isEqualTo("Stay");
        verify(expenseRepository).save(any(Expense.class));
    }

    @Test
    @DisplayName("addExpense: should throw when user not found")
    void addExpense_userNotFound_throws() {
        when(tripAccessService.findAccessibleTrip("ghost@example.com", 10L)).thenReturn(trip);
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.addExpense("ghost@example.com", 10L, expenseRequest))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    /* ── Get expenses ── */

    @Test
    @DisplayName("getExpenses: should return list of expenses for a trip")
    void getExpenses_returnsList() {
        when(tripAccessService.findAccessibleTrip("alice@example.com", 10L)).thenReturn(trip);
        when(expenseRepository.findByTripIdOrderByExpenseDateDescCreatedAtDesc(10L))
            .thenReturn(List.of(expense));

        List<ExpenseResponse> result = expenseService.getExpenses("alice@example.com", 10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Hotel Stay");
    }

    @Test
    @DisplayName("getExpenses: should return empty list when no expenses")
    void getExpenses_empty() {
        when(tripAccessService.findAccessibleTrip("alice@example.com", 10L)).thenReturn(trip);
        when(expenseRepository.findByTripIdOrderByExpenseDateDescCreatedAtDesc(10L))
            .thenReturn(List.of());

        List<ExpenseResponse> result = expenseService.getExpenses("alice@example.com", 10L);
        assertThat(result).isEmpty();
    }

    /* ── Expense summary ── */

    @Test
    @DisplayName("getExpenseSummary: should calculate totalSpent and remainingBudget")
    void getExpenseSummary_calculations() {
        Expense e1 = buildExpense("Lunch",  "3000", "Food");
        Expense e2 = buildExpense("Hotel",  "5000", "Stay");

        when(tripAccessService.findAccessibleTrip("alice@example.com", 10L)).thenReturn(trip);
        when(expenseRepository.findByTripIdOrderByExpenseDateDescCreatedAtDesc(10L))
            .thenReturn(List.of(e1, e2));

        Map<String, Object> summary = expenseService.getExpenseSummary("alice@example.com", 10L);

        BigDecimal totalSpent = (BigDecimal) summary.get("totalSpent");
        BigDecimal remaining  = (BigDecimal) summary.get("remainingBudget");

        assertThat(totalSpent).isEqualByComparingTo("8000");
        assertThat(remaining).isEqualByComparingTo("12000"); // 20000 - 8000
        assertThat(summary.get("expenseCount")).isEqualTo(2);
    }

    @Test
    @DisplayName("getExpenseSummary: should group expenses by category")
    void getExpenseSummary_categoryTotals() {
        Expense e1 = buildExpense("Lunch",  "2000", "Food");
        Expense e2 = buildExpense("Dinner", "1500", "Food");
        Expense e3 = buildExpense("Hotel",  "5000", "Stay");

        when(tripAccessService.findAccessibleTrip("alice@example.com", 10L)).thenReturn(trip);
        when(expenseRepository.findByTripIdOrderByExpenseDateDescCreatedAtDesc(10L))
            .thenReturn(List.of(e1, e2, e3));

        Map<String, Object> summary = expenseService.getExpenseSummary("alice@example.com", 10L);

        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> cats = (Map<String, BigDecimal>) summary.get("categoryTotals");
        assertThat(cats.get("Food")).isEqualByComparingTo("3500");
        assertThat(cats.get("Stay")).isEqualByComparingTo("5000");
    }

    @Test
    @DisplayName("getExpenseSummary: remainingBudget should be null when no budget set")
    void getExpenseSummary_noBudget_remainingIsNull() {
        trip.setBudget(null);
        when(tripAccessService.findAccessibleTrip("alice@example.com", 10L)).thenReturn(trip);
        when(expenseRepository.findByTripIdOrderByExpenseDateDescCreatedAtDesc(10L))
            .thenReturn(List.of());

        Map<String, Object> summary = expenseService.getExpenseSummary("alice@example.com", 10L);
        assertThat(summary.get("remainingBudget")).isNull();
    }

    /* ── Delete expense ── */

    @Test
    @DisplayName("deleteExpense: should delete expense belonging to trip")
    void deleteExpense_success() {
        when(tripAccessService.findAccessibleTrip("alice@example.com", 10L)).thenReturn(trip);
        when(expenseRepository.findById(any())).thenReturn(Optional.of(expense));

        assertThatNoException().isThrownBy(
            () -> expenseService.deleteExpense("alice@example.com", 10L, 1L));

        verify(expenseRepository).delete(expense);
    }

    @Test
    @DisplayName("deleteExpense: should throw ResourceNotFoundException when expense not found")
    void deleteExpense_notFound_throws() {
        when(tripAccessService.findAccessibleTrip("alice@example.com", 10L)).thenReturn(trip);
        when(expenseRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.deleteExpense("alice@example.com", 10L, 999L))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    /* ── Helper ── */
    private Expense buildExpense(String title, String amount, String category) {
        Expense e = new Expense();
        e.setTrip(trip);
        e.setPaidBy(owner);  // required — ExpenseResponse.fromEntity calls getPaidBy()
        e.setTitle(title);
        e.setAmount(new BigDecimal(amount));
        e.setCategory(category);
        e.setExpenseDate(LocalDate.of(2025, 12, 3));
        return e;
    }
}
