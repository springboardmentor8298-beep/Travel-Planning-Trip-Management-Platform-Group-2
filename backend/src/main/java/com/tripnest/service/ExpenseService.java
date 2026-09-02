package com.tripnest.service;

import com.tripnest.dto.ExpenseAnalyticsDTO;
import com.tripnest.entity.Budget;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Notification;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Optional<Expense> getExpenseById(Integer id) {
        return expenseRepository.findById(id);
    }

    public List<Expense> getExpensesByBudgetId(Integer budgetId) {
        return expenseRepository.findByBudget_BudgetId(budgetId);
    }

    public List<Expense> getExpensesByTripId(Integer tripId) {
        return expenseRepository.findByBudget_Trip_TripId(tripId);
    }

    public Expense saveExpense(Expense expense) {
        if (expense.getAmount() == null || expense.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Expense amount cannot be negative");
        }

        // If budget not explicitly linked, try resolving via tripId
        if (expense.getBudget() == null || expense.getBudget().getBudgetId() == null) {
            throw new IllegalArgumentException("Expense must be linked to a budget");
        }

        Expense saved = expenseRepository.save(expense);
        syncBudgetCalculations(saved.getBudget().getBudgetId());
        return saved;
    }

    public Expense updateExpense(Expense expense) {
        if (expense.getAmount() == null || expense.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Expense amount cannot be negative");
        }
        Expense updated = expenseRepository.save(expense);
        if (updated.getBudget() != null) {
            syncBudgetCalculations(updated.getBudget().getBudgetId());
        }
        return updated;
    }

    public void deleteExpense(Integer id) {
        Optional<Expense> existing = expenseRepository.findById(id);
        if (existing.isPresent()) {
            Integer budgetId = existing.get().getBudget() != null ? existing.get().getBudget().getBudgetId() : null;
            expenseRepository.deleteById(id);
            if (budgetId != null) {
                syncBudgetCalculations(budgetId);
            }
        }
    }

    public ExpenseAnalyticsDTO getExpenseAnalytics(Integer tripId) {
        List<Expense> expenses = tripId != null ? getExpensesByTripId(tripId) : getAllExpenses();
        Optional<Budget> budgetOpt = tripId != null ? budgetRepository.findByTrip_TripId(tripId) : Optional.empty();

        BigDecimal totalBudget = budgetOpt.map(Budget::getTotalBudget).orElse(BigDecimal.ZERO);
        if (totalBudget.compareTo(BigDecimal.ZERO) == 0 && !expenses.isEmpty()) {
            totalBudget = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal totalSpending = expenses.stream()
                .map(e -> e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = totalBudget.subtract(totalSpending);

        double pct = 0.0;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            pct = totalSpending.divide(totalBudget, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        Map<String, BigDecimal> categoryMap = new LinkedHashMap<>();
        String[] categories = {"Accommodation", "Transportation", "Food", "Activities", "Shopping", "Other"};
        for (String cat : categories) {
            categoryMap.put(cat, BigDecimal.ZERO);
        }

        for (Expense exp : expenses) {
            String cat = exp.getCategory() != null ? exp.getCategory() : "Other";
            BigDecimal curr = categoryMap.getOrDefault(cat, BigDecimal.ZERO);
            categoryMap.put(cat, curr.add(exp.getAmount() != null ? exp.getAmount() : BigDecimal.ZERO));
        }

        List<Expense> recent = expenses.stream()
                .sorted(Comparator.comparing(Expense::getExpenseDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .collect(Collectors.toList());

        ExpenseAnalyticsDTO dto = new ExpenseAnalyticsDTO();
        dto.setTotalBudget(totalBudget);
        dto.setTotalSpending(totalSpending);
        dto.setRemainingBudget(remaining);
        dto.setBudgetUtilizationPercentage(Math.round(pct * 100.0) / 100.0);
        dto.setSpendingByCategory(categoryMap);
        dto.setRecentExpenses(recent);
        return dto;
    }

    private void syncBudgetCalculations(Integer budgetId) {
        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);
        if (budgetOpt.isEmpty()) return;

        Budget budget = budgetOpt.get();
        List<Expense> expenses = expenseRepository.findByBudget_BudgetId(budgetId);

        BigDecimal totalSpent = expenses.stream()
                .map(e -> e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        budget.setEstimatedCost(totalSpent);
        BigDecimal totalBudget = budget.getTotalBudget() != null ? budget.getTotalBudget() : BigDecimal.ZERO;
        budget.setRemainingBudget(totalBudget.subtract(totalSpent));
        budgetRepository.save(budget);

        // Alert threshold check
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0 && budget.getTrip() != null && budget.getTrip().getUser() != null) {
            double ratio = totalSpent.doubleValue() / totalBudget.doubleValue();
            if (ratio >= 0.8) {
                Notification alert = new Notification();
                alert.setUser(budget.getTrip().getUser());
                alert.setNotificationTitle("Budget Threshold Alert");
                alert.setMessage("Expenses for trip '" + budget.getTrip().getTripName() + "' have reached " + (int)(ratio * 100) + "% of total budget.");
                alert.setNotificationType("BUDGET_ALERT");
                alert.setIsRead(false);
                alert.setCreatedAt(LocalDateTime.now());
                notificationService.saveNotification(alert);
            }
        }
    }
}