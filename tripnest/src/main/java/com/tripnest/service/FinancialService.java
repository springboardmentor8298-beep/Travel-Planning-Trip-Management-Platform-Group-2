package com.tripnest.service;

import com.tripnest.dto.*;
import com.tripnest.entity.Budget;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class FinancialService {
    private static final Set<String> CATEGORIES = Set.of("Transportation", "Hotel", "Food", "Shopping", "Entertainment", "Miscellaneous");
    private final BudgetRepository budgets;
    private final ExpenseRepository expenses;
    private final TripRepository trips;
    private final TripMemberRepository members;
    private final UserRepository users;
    private final NotificationService notifications;

    public FinancialService(BudgetRepository budgets, ExpenseRepository expenses, TripRepository trips,
                            TripMemberRepository members, UserRepository users, NotificationService notifications) {
        this.budgets = budgets; this.expenses = expenses; this.trips = trips; this.members = members; this.users = users;
        this.notifications = notifications;
    }

    public BudgetResponse getBudget(String email, Long tripId) { accessible(email, tripId); return budgetResponse(tripId); }

    public BudgetResponse planBudget(String email, Long tripId, BudgetRequest request) {
        Trip trip = owner(email, tripId);
        Budget budget = budgets.findByTripId(tripId).orElseGet(Budget::new);
        budget.setTrip(trip); budget.setTotalBudget(money(request.totalBudget()));
        updateBudgetTotals(budget, tripId);
        budgets.save(budget);
        return budgetResponse(tripId);
    }

    public List<ExpenseResponse> listExpenses(String email, Long tripId) {
        accessible(email, tripId);
        return expenses.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId).stream().map(this::expenseResponse).toList();
    }

    public ExpenseResponse addExpense(String email, Long tripId, ExpenseRequest request) {
        Trip trip = accessible(email, tripId);
        Expense expense = new Expense(); expense.setTrip(trip); expense.setUser(user(email)); apply(expense, request);
        Expense saved = expenses.save(expense); refreshBudget(tripId); return expenseResponse(saved);
    }

    public ExpenseResponse updateExpense(String email, Long tripId, Long expenseId, ExpenseRequest request) {
        Expense expense = expenseForTrip(tripId, expenseId);
        if (!expense.getUser().getEmail().equals(email) && !owner(email, tripId).getUser().getEmail().equals(email)) throw new RuntimeException("Only the payer or trip owner can edit this expense");
        apply(expense, request); refreshBudget(tripId); return expenseResponse(expense);
    }

    public void deleteExpense(String email, Long tripId, Long expenseId) {
        Expense expense = expenseForTrip(tripId, expenseId);
        if (!expense.getUser().getEmail().equals(email) && !owner(email, tripId).getUser().getEmail().equals(email)) throw new RuntimeException("Only the payer or trip owner can delete this expense");
        expenses.delete(expense); refreshBudget(tripId);
    }

    public ExpenseSummaryResponse summary(String email, Long tripId) {
        accessible(email, tripId);
        List<Expense> all = expenses.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId);
        Map<String, BigDecimal> byCategory = new LinkedHashMap<>();
        CATEGORIES.forEach(category -> byCategory.put(category, BigDecimal.ZERO.setScale(2)));
        for (Expense expense : all) byCategory.merge(expense.getCategory(), money(expense.getAmount()), BigDecimal::add);
        BigDecimal total = all.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ExpenseSummaryResponse(money(total), byCategory, budgetResponse(tripId));
    }
    public String csvReport(String email,Long tripId){accessible(email,tripId);StringBuilder csv=new StringBuilder("Date,Category,Description,Amount,Payment method,Paid by\n");for(Expense e:expenses.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId)){csv.append(e.getExpenseDate()).append(',').append(escape(e.getCategory())).append(',').append(escape(e.getDescription())).append(',').append(e.getAmount()).append(',').append(escape(e.getPaymentMethod())).append(',').append(escape(e.getUser().getFullName())).append('\n');}return csv.toString();}
    private String escape(String value){return "\""+(value==null?"":value.replace("\"","\"\""))+"\"";}

    private void apply(Expense expense, ExpenseRequest request) {
        if (!CATEGORIES.contains(request.category())) throw new RuntimeException("Unsupported expense category");
        expense.setCategory(request.category()); expense.setDescription(request.description().trim()); expense.setAmount(money(request.amount()));
        expense.setPaymentMethod(request.paymentMethod() == null || request.paymentMethod().isBlank() ? "Other" : request.paymentMethod().trim());
        expense.setExpenseDate(request.expenseDate()); if (expense.getCreatedAt() == null) expense.setCreatedAt(LocalDateTime.now());
    }

    private void refreshBudget(Long tripId) {
        budgets.findByTripId(tripId).ifPresent(budget -> {
            updateBudgetTotals(budget, tripId);
            if (budget.getSpentAmount().compareTo(budget.getTotalBudget()) > 0) {
                notifications.dispatch(budget.getTrip().getUser(), "Budget alert", "Your trip budget for " + budget.getTrip().getTripName() + " has been exceeded.");
            }
        });
    }
    private void updateBudgetTotals(Budget budget, Long tripId) {
        BigDecimal spent = expenses.findByTripIdOrderByExpenseDateDescCreatedAtDesc(tripId).stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        budget.setSpentAmount(money(spent)); budget.setRemainingBudget(money(budget.getTotalBudget().subtract(spent)));
    }
    private BudgetResponse budgetResponse(Long tripId) {
        Budget budget = budgets.findByTripId(tripId).orElse(null);
        if (budget == null) return new BudgetResponse(null, tripId, BigDecimal.ZERO.setScale(2), BigDecimal.ZERO.setScale(2), BigDecimal.ZERO.setScale(2), 0, false);
        int utilization = budget.getTotalBudget().signum() == 0 ? 0 : budget.getSpentAmount().multiply(BigDecimal.valueOf(100)).divide(budget.getTotalBudget(), 0, RoundingMode.HALF_UP).intValue();
        return new BudgetResponse(budget.getId(), tripId, budget.getTotalBudget(), budget.getSpentAmount(), budget.getRemainingBudget(), utilization, budget.getSpentAmount().compareTo(budget.getTotalBudget()) > 0);
    }
    private ExpenseResponse expenseResponse(Expense expense) { return new ExpenseResponse(expense.getId(), expense.getTrip().getId(), expense.getCategory(), expense.getDescription(), expense.getAmount(), expense.getPaymentMethod(), expense.getExpenseDate(), expense.getUser().getFullName()); }
    private Expense expenseForTrip(Long tripId, Long expenseId) { return expenses.findById(expenseId).filter(expense -> expense.getTrip().getId().equals(tripId)).orElseThrow(() -> new RuntimeException("Expense not found")); }
    private Trip accessible(String email, Long tripId) { return trips.findById(tripId).filter(trip -> trip.getUser().getEmail().equals(email) || members.findByTripIdAndUserEmail(tripId, email).isPresent()).orElseThrow(() -> new RuntimeException("Trip not found")); }
    private Trip owner(String email, Long tripId) { return trips.findById(tripId).filter(trip -> trip.getUser().getEmail().equals(email)).orElseThrow(() -> new RuntimeException("Trip not found")); }
    private User user(String email) { return users.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found")); }
    private BigDecimal money(BigDecimal amount) { return amount.setScale(2, RoundingMode.HALF_UP); }
}
