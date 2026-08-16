package com.tripnest.service;

import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.entity.*;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripDocumentRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final TripDocumentRepository tripDocumentRepository;
    private final UserRepository userRepository;
    private final TripAccessService tripAccessService;
    private final NotificationService notificationService;

    public ExpenseResponse addExpense(String email, Long tripId, ExpenseRequest request) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertCanEdit(email, trip);

        User paidBy = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TripDocument receipt = null;
        if (request.getReceiptDocumentId() != null) {
            receipt = tripDocumentRepository.findById(request.getReceiptDocumentId())
                    .orElseThrow(() -> new IllegalArgumentException("Receipt document not found"));
        }

        Expense expense = Expense.builder()
                .trip(trip)
                .paidBy(paidBy)
                .category(request.getCategory())
                .amount(request.getAmount())
                .description(request.getDescription())
                .expenseDate(request.getExpenseDate())
                .receiptDocument(receipt)
                .build();

        expenseRepository.save(expense);

        checkBudgetAndNotify(trip);

        return toResponse(expense);
    }

    public List<ExpenseResponse> getExpensesForTrip(String email, Long tripId) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertHasAccess(email, trip);

        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ExpenseResponse updateExpense(String email, Long expenseId, ExpenseRequest request) {
        Expense expense = findExpenseOrThrow(expenseId);
        tripAccessService.assertCanEdit(email, expense.getTrip());

        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        expenseRepository.save(expense);
        checkBudgetAndNotify(expense.getTrip());
        return toResponse(expense);
    }

    public void deleteExpense(String email, Long expenseId) {
        Expense expense = findExpenseOrThrow(expenseId);
        tripAccessService.assertCanEdit(email, expense.getTrip());
        expenseRepository.delete(expense);
    }

    /**
     * Notification System requirement: "Budget alerts".
     * Fires a notification to the trip owner once spending crosses 80%
     * (WARNING) and again once it crosses 100% (CRITICAL) of the total budget.
     */
    private void checkBudgetAndNotify(Trip trip) {
        budgetRepository.findByTripId(trip.getId()).ifPresent(budget -> {
            double totalSpent = expenseRepository.sumAmountByTripId(trip.getId());
            double utilization = (totalSpent / budget.getTotalBudget()) * 100;

            if (utilization >= 100) {
                notificationService.send(
                        trip.getOwner(),
                        NotificationType.BUDGET_ALERT,
                        "Trip \"" + trip.getTitle() + "\" has EXCEEDED its budget ("
                                + String.format("%.0f", utilization) + "% spent).",
                        trip.getId()
                );
            } else if (utilization >= 80) {
                notificationService.send(
                        trip.getOwner(),
                        NotificationType.BUDGET_ALERT,
                        "Trip \"" + trip.getTitle() + "\" has used "
                                + String.format("%.0f", utilization) + "% of its budget.",
                        trip.getId()
                );
            }
        });
    }

    private Expense findExpenseOrThrow(Long expenseId) {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
    }

    private ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getTrip().getId(),
                e.getPaidBy().getEmail(),
                e.getPaidBy().getFullName(),
                e.getCategory(),
                e.getAmount(),
                e.getDescription(),
                e.getExpenseDate(),
                e.getReceiptDocument() != null ? e.getReceiptDocument().getId() : null
        );
    }
}
