package com.tripnest.service;

import com.tripnest.dto.*;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripMemberRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * The innovative piece of Milestone 3:
 *
 *  1. Budget burn-rate + overspend prediction - projects whether a trip
 *     will bust its budget BEFORE it happens, based on current daily spend.
 *
 *  2. Group settlement ("who owes whom") - a greedy minimum-cash-flow
 *     algorithm that reduces N unequal payments down to the smallest
 *     possible number of peer-to-peer transfers.
 */
@Service
@RequiredArgsConstructor
public class SmartInsightsService {

    private static final double EPSILON = 0.01;

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final TripMemberRoleRepository tripMemberRoleRepository;
    private final TripAccessService tripAccessService;

    // ---------------------------------------------------------------
    // 1. Budget burn-rate & overspend prediction
    // ---------------------------------------------------------------

    public BudgetInsightsResponse getBudgetInsights(String email, Long tripId) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertHasAccess(email, trip);

        double totalBudget = budgetRepository.findByTripId(tripId)
                .map(b -> b.getTotalBudget())
                .orElse(trip.getBudget() != null ? trip.getBudget() : 0.0);

        double totalSpent = expenseRepository.sumAmountByTripId(tripId);

        LocalDate today = LocalDate.now();
        LocalDate effectiveStart = trip.getStartDate();
        LocalDate effectiveToday = today.isBefore(effectiveStart) ? effectiveStart
                : today.isAfter(trip.getEndDate()) ? trip.getEndDate() : today;

        long totalTripDays = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        long daysElapsed = Math.max(1, ChronoUnit.DAYS.between(effectiveStart, effectiveToday) + 1);
        long daysRemaining = Math.max(0, totalTripDays - daysElapsed);

        double dailyBurnRate = totalSpent / daysElapsed;
        double projectedTotalSpend = dailyBurnRate * totalTripDays;
        double projectedOverspend = projectedTotalSpend - totalBudget;

        double budgetUtilizationPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        double projectedUtilizationPercent = totalBudget > 0 ? (projectedTotalSpend / totalBudget) * 100 : 0;

        String riskLevel;
        String riskMessage;
        if (totalBudget <= 0) {
            riskLevel = "SAFE";
            riskMessage = "No budget has been set for this trip yet.";
        } else if (projectedUtilizationPercent >= 100) {
            riskLevel = "CRITICAL";
            riskMessage = String.format(
                    "At the current daily spend of %.2f, this trip is projected to exceed its budget by %.2f.",
                    dailyBurnRate, Math.max(0, projectedOverspend));
        } else if (projectedUtilizationPercent >= 80) {
            riskLevel = "WARNING";
            riskMessage = String.format(
                    "At the current pace, this trip is projected to use %.0f%% of its budget - keep an eye on spending.",
                    projectedUtilizationPercent);
        } else {
            riskLevel = "SAFE";
            riskMessage = String.format(
                    "Spending is on track - projected to use %.0f%% of the budget.",
                    projectedUtilizationPercent);
        }

        return new BudgetInsightsResponse(
                tripId, totalBudget, totalSpent, daysElapsed, totalTripDays, daysRemaining,
                round2(dailyBurnRate), round2(projectedTotalSpend), round2(projectedOverspend),
                round2(budgetUtilizationPercent), round2(projectedUtilizationPercent),
                riskLevel, riskMessage
        );
    }

    // ---------------------------------------------------------------
    // 2. Group settlement - minimum transaction debt resolution
    // ---------------------------------------------------------------

    public SettlementResponse getSettlement(String email, Long tripId) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertHasAccess(email, trip);

        List<Expense> expenses = expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId);

        // Build the member set: owner + legacy travelers + role-based members, deduplicated by email
        Map<String, User> members = new LinkedHashMap<>();
        members.put(trip.getOwner().getEmail(), trip.getOwner());
        trip.getTravelers().forEach(u -> members.put(u.getEmail(), u));
        tripMemberRoleRepository.findByTripId(tripId).forEach(m -> members.put(m.getUser().getEmail(), m.getUser()));

        double totalExpenses = expenses.stream().mapToDouble(Expense::getAmount).sum();
        int memberCount = Math.max(1, members.size());
        double fairShare = totalExpenses / memberCount;

        // totalPaid per member
        Map<String, Double> paidByEmail = new HashMap<>();
        members.keySet().forEach(e -> paidByEmail.put(e, 0.0));
        for (Expense expense : expenses) {
            String payerEmail = expense.getPaidBy().getEmail();
            paidByEmail.merge(payerEmail, expense.getAmount(), Double::sum);
        }

        List<MemberBalance> balances = new ArrayList<>();
        // working copy used by the settlement algorithm: email -> net balance
        Map<String, Double> netBalances = new LinkedHashMap<>();

        for (Map.Entry<String, User> entry : members.entrySet()) {
            String memberEmail = entry.getKey();
            User user = entry.getValue();
            double paid = paidByEmail.getOrDefault(memberEmail, 0.0);
            double net = paid - fairShare;
            balances.add(new MemberBalance(memberEmail, user.getFullName(), round2(paid), round2(fairShare), round2(net)));
            netBalances.put(memberEmail, net);
        }

        List<SettlementTransaction> transactions = computeMinimalTransactions(netBalances, members);

        return new SettlementResponse(tripId, round2(totalExpenses), memberCount, round2(fairShare), balances, transactions);
    }

    /**
     * Greedy minimum-cash-flow settlement: repeatedly match the person who
     * owes the most against the person who is owed the most, settle the
     * smaller of the two amounts, and repeat. This is the standard practical
     * heuristic (used by apps like Splitwise) for minimizing the NUMBER of
     * transactions needed to settle a group's debts - much better than the
     * naive "everyone pays everyone" O(n^2) approach.
     */
    private List<SettlementTransaction> computeMinimalTransactions(Map<String, Double> netBalances, Map<String, User> members) {
        List<SettlementTransaction> transactions = new ArrayList<>();

        // Use mutable entries we can sort repeatedly
        List<Map.Entry<String, Double>> balanceList = new ArrayList<>(netBalances.entrySet());

        while (true) {
            balanceList.sort((a, b) -> Double.compare(b.getValue(), a.getValue())); // descending: biggest creditor first

            Map.Entry<String, Double> creditor = balanceList.get(0);                 // most owed
            Map.Entry<String, Double> debtor = balanceList.get(balanceList.size() - 1); // owes the most

            if (creditor.getValue() <= EPSILON || debtor.getValue() >= -EPSILON) {
                break; // everyone is settled within rounding tolerance
            }

            double amount = Math.min(creditor.getValue(), -debtor.getValue());
            amount = round2(amount);

            User fromUser = members.get(debtor.getKey());
            User toUser = members.get(creditor.getKey());

            transactions.add(new SettlementTransaction(
                    debtor.getKey(), fromUser.getFullName(),
                    creditor.getKey(), toUser.getFullName(),
                    amount
            ));

            creditor.setValue(round2(creditor.getValue() - amount));
            debtor.setValue(round2(debtor.getValue() + amount));
        }

        return transactions;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
