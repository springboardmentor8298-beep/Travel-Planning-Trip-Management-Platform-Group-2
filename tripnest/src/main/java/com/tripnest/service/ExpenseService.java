package com.tripnest.service;

import com.tripnest.dto.ExpenseAnalyticsResponse;
import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.entity.Expense;
import com.tripnest.entity.ExpenseCategory;
import com.tripnest.entity.Trip;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TripRepository tripRepository;


    // ==========================================
    // CREATE EXPENSE
    // ==========================================

    public ExpenseResponse createExpense(
            Long tripId,
            ExpenseRequest request,
            Long userId) {

        Trip trip = getUserTrip(tripId, userId);

        Expense expense = new Expense();

        expense.setTitle(request.getTitle());

        expense.setCategory(
                ExpenseCategory.valueOf(
                        request.getCategory().toUpperCase()
                )
        );

        expense.setAmount(request.getAmount());

        expense.setDescription(
                request.getDescription()
        );

        expense.setExpenseDate(
                request.getExpenseDate()
        );

        expense.setTrip(trip);

        Expense saved =
                expenseRepository.save(expense);

        return mapToResponse(saved);
    }


    // ==========================================
    // GET ALL EXPENSES
    // ==========================================

    public List<ExpenseResponse> getTripExpenses(
            Long tripId,
            Long userId) {

        getUserTrip(tripId, userId);

        return expenseRepository
                .findByTripId(tripId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // ==========================================
    // GET SINGLE EXPENSE
    // ==========================================

    public ExpenseResponse getExpenseById(
            Long expenseId,
            Long userId) {

        Expense expense =
                expenseRepository
                        .findById(expenseId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Expense not found"
                                )
                        );

        checkOwnership(
                expense,
                userId
        );

        return mapToResponse(expense);
    }


    // ==========================================
    // UPDATE EXPENSE
    // ==========================================

    public ExpenseResponse updateExpense(
            Long expenseId,
            ExpenseRequest request,
            Long userId) {

        Expense expense =
                expenseRepository
                        .findById(expenseId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Expense not found"
                                )
                        );

        checkOwnership(
                expense,
                userId
        );

        expense.setTitle(
                request.getTitle()
        );

        expense.setCategory(
                ExpenseCategory.valueOf(
                        request.getCategory().toUpperCase()
                )
        );

        expense.setAmount(
                request.getAmount()
        );

        expense.setDescription(
                request.getDescription()
        );

        expense.setExpenseDate(
                request.getExpenseDate()
        );

        Expense updated =
                expenseRepository.save(expense);

        return mapToResponse(updated);
    }


    // ==========================================
    // DELETE EXPENSE
    // ==========================================

    public void deleteExpense(
            Long expenseId,
            Long userId) {

        Expense expense =
                expenseRepository
                        .findById(expenseId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Expense not found"
                                )
                        );

        checkOwnership(
                expense,
                userId
        );

        expenseRepository.delete(expense);
    }


    // ==========================================
    // TOTAL SPENT
    // ==========================================

    public Double getTotalSpent(
            Long tripId,
            Long userId) {

        getUserTrip(
                tripId,
                userId
        );

        return expenseRepository
                .findByTripId(tripId)
                .stream()
                .mapToDouble(
                        Expense::getAmount
                )
                .sum();
    }


    // ==========================================
    // EXPENSE ANALYTICS
    // ==========================================

    public ExpenseAnalyticsResponse getExpenseAnalytics(
            Long tripId,
            Long userId) {

        // Verify ownership
        Trip trip =
                getUserTrip(
                        tripId,
                        userId
                );

        // Get expenses
        List<Expense> expenses =
                expenseRepository
                        .findByTripId(tripId);


        // --------------------------------------
        // TOTAL BUDGET
        // --------------------------------------

        Double totalBudget =
                trip.getBudget() != null
                        ? trip.getBudget()
                        : 0.0;


        // --------------------------------------
        // TOTAL SPENT
        // --------------------------------------

        Double totalSpent =
                expenses
                        .stream()
                        .mapToDouble(
                                expense ->
                                        expense.getAmount() != null
                                                ? expense.getAmount()
                                                : 0.0
                        )
                        .sum();


        // --------------------------------------
        // REMAINING BUDGET
        // --------------------------------------

        Double remainingBudget =
                totalBudget - totalSpent;


        // --------------------------------------
        // BUDGET USED %
        // --------------------------------------

        Double budgetUsedPercentage = 0.0;

        if (totalBudget > 0) {

            budgetUsedPercentage =
                    (totalSpent / totalBudget) * 100;

            budgetUsedPercentage =
                    Math.round(
                            budgetUsedPercentage * 100.0
                    ) / 100.0;
        }


        // --------------------------------------
        // TOTAL NUMBER OF EXPENSES
        // --------------------------------------

        Integer totalExpenses =
                expenses.size();


        // --------------------------------------
        // AVERAGE EXPENSE
        // --------------------------------------

        Double averageExpense = 0.0;

        if (!expenses.isEmpty()) {

            averageExpense =
                    totalSpent / expenses.size();

            averageExpense =
                    Math.round(
                            averageExpense * 100.0
                    ) / 100.0;
        }


        // --------------------------------------
        // CATEGORY TOTALS
        // --------------------------------------

        Map<String, Double> categoryTotals =
                new LinkedHashMap<>();

        // Initialize all categories
        for (ExpenseCategory category :
                ExpenseCategory.values()) {

            categoryTotals.put(
                    category.name(),
                    0.0
            );
        }


        // Add actual expenses
        for (Expense expense : expenses) {

            if (expense.getCategory() != null &&
                    expense.getAmount() != null) {

                String category =
                        expense
                                .getCategory()
                                .name();

                Double currentAmount =
                        categoryTotals.getOrDefault(
                                category,
                                0.0
                        );

                categoryTotals.put(
                        category,
                        currentAmount +
                                expense.getAmount()
                );
            }
        }


        // Round category values
        categoryTotals.replaceAll(
                (category, amount) ->
                        Math.round(
                                amount * 100.0
                        ) / 100.0
        );


        // --------------------------------------
        // HIGHEST SPENDING CATEGORY
        // --------------------------------------

        String highestSpendingCategory =
                null;

        Double highestCategoryAmount =
                0.0;

        for (Map.Entry<String, Double> entry :
                categoryTotals.entrySet()) {

            if (entry.getValue() >
                    highestCategoryAmount) {

                highestCategoryAmount =
                        entry.getValue();

                highestSpendingCategory =
                        entry.getKey();
            }
        }


        // If there are no expenses
        if (totalSpent == 0) {

            highestSpendingCategory = null;
            highestCategoryAmount = 0.0;
        }


        // --------------------------------------
        // BUILD RESPONSE
        // --------------------------------------

        ExpenseAnalyticsResponse response =
                new ExpenseAnalyticsResponse();

        response.setTripId(tripId);

        response.setTotalBudget(
                totalBudget
        );

        response.setTotalSpent(
                totalSpent
        );

        response.setRemainingBudget(
                remainingBudget
        );

        response.setBudgetUsedPercentage(
                budgetUsedPercentage
        );

        response.setTotalExpenses(
                totalExpenses
        );

        response.setAverageExpense(
                averageExpense
        );

        response.setHighestSpendingCategory(
                highestSpendingCategory
        );

        response.setHighestCategoryAmount(
                highestCategoryAmount
        );

        response.setCategoryTotals(
                categoryTotals
        );

        return response;
    }


    // ==========================================
    // VERIFY TRIP OWNERSHIP
    // ==========================================

    private Trip getUserTrip(
            Long tripId,
            Long userId) {

        Trip trip =
                tripRepository
                        .findById(tripId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Trip not found"
                                )
                        );

        if (trip.getUser() == null ||
                !trip.getUser()
                        .getId()
                        .equals(userId)) {

            throw new RuntimeException(
                    "Unauthorized"
            );
        }

        return trip;
    }


    // ==========================================
    // VERIFY EXPENSE OWNERSHIP
    // ==========================================

    private void checkOwnership(
            Expense expense,
            Long userId) {

        Trip trip =
                expense.getTrip();

        if (trip == null ||
                trip.getUser() == null ||
                !trip.getUser()
                        .getId()
                        .equals(userId)) {

            throw new RuntimeException(
                    "Unauthorized"
            );
        }
    }


    // ==========================================
    // ENTITY → RESPONSE
    // ==========================================

    private ExpenseResponse mapToResponse(
            Expense expense) {

        ExpenseResponse response =
                new ExpenseResponse();

        response.setId(
                expense.getId()
        );

        response.setTitle(
                expense.getTitle()
        );

        response.setCategory(
                expense.getCategory().name()
        );

        response.setAmount(
                expense.getAmount()
        );

        response.setDescription(
                expense.getDescription()
        );

        response.setExpenseDate(
                expense.getExpenseDate()
        );

        response.setTripId(
                expense.getTrip().getId()
        );

        response.setCreatedAt(
                expense.getCreatedAt()
        );

        response.setUpdatedAt(
                expense.getUpdatedAt()
        );

        return response;
    }
}