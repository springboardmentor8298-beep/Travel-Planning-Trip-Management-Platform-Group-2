package com.tripnest.service;

import com.tripnest.dto.BudgetSummaryResponse;
import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.entity.*;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for expense CRUD and budget summary operations.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;

    private void checkTripAccess(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        boolean isOwner = trip.getUser().getId().equals(userId);
        boolean isMember = tripMemberRepository
                .findByTripIdAndUserId(tripId, userId)
                .map(m -> m.getStatus() == MemberStatus.ACCEPTED)
                .orElse(false);
        if (!isOwner && !isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this trip");
        }
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public ExpenseResponse addExpense(Long tripId, Long userId, ExpenseRequest request) {
        checkTripAccess(tripId, userId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setUser(user);
        applyRequest(expense, request);

        return toResponse(expenseRepository.save(expense));
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByTrip(Long tripId, Long userId) {
        checkTripAccess(tripId, userId);
        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BudgetSummaryResponse getBudgetSummary(Long tripId, Long userId) {
        checkTripAccess(tripId, userId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        BigDecimal totalBudget = trip.getBudget() != null ? trip.getBudget() : BigDecimal.ZERO;
        // BUG 4 fix: SUM() returns NULL when there are no expenses — null-coalesce to ZERO
        BigDecimal totalSpent = Optional.ofNullable(expenseRepository.sumAmountByTripId(tripId))
                .orElse(BigDecimal.ZERO);

        // Build category breakdown
        Map<ExpenseCategory, BigDecimal> breakdown = new EnumMap<>(ExpenseCategory.class);
        for (ExpenseCategory cat : ExpenseCategory.values()) {
            breakdown.put(cat, BigDecimal.ZERO);
        }
        expenseRepository.sumByCategory(tripId).forEach(row -> {
            ExpenseCategory cat = (ExpenseCategory) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            breakdown.put(cat, sum);
        });

        BigDecimal remaining = totalBudget.subtract(totalSpent);
        return new BudgetSummaryResponse(totalBudget, totalSpent, remaining, remaining.compareTo(BigDecimal.ZERO) < 0, breakdown);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public ExpenseResponse updateExpense(Long tripId, Long expenseId, Long userId, ExpenseRequest request) {
        Expense expense = expenseRepository.findByIdAndTripId(expenseId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        // Only the creator can edit
        if (!expense.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your expense");
        }
        applyRequest(expense, request);
        return toResponse(expenseRepository.save(expense));
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public void deleteExpense(Long tripId, Long expenseId, Long userId) {
        Expense expense = expenseRepository.findByIdAndTripId(expenseId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        if (!expense.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your expense");
        }
        expenseRepository.delete(expense);
    }

    // -------------------------------------------------------------------------
    // Group Expense Splitting (Splitwise-style)
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public com.tripnest.dto.ExpenseSplitResponse getGroupExpenseSplits(Long tripId, Long userId) {
        checkTripAccess(tripId, userId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        // Collect all participants: Owner + Accepted members
        Map<Long, User> participants = new LinkedHashMap<>();
        participants.put(trip.getUser().getId(), trip.getUser());

        tripMemberRepository.findByTripIdAndStatus(tripId, MemberStatus.ACCEPTED)
                .forEach(m -> participants.put(m.getUser().getId(), m.getUser()));

        List<Expense> expenses = expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId);

        BigDecimal totalSpent = BigDecimal.ZERO;
        Map<Long, BigDecimal> paidByUser = new HashMap<>();
        for (Long uid : participants.keySet()) {
            paidByUser.put(uid, BigDecimal.ZERO);
        }

        for (Expense exp : expenses) {
            BigDecimal amt = exp.getAmount() != null ? exp.getAmount() : BigDecimal.ZERO;
            totalSpent = totalSpent.add(amt);
            Long payerId = exp.getUser().getId();
            paidByUser.put(payerId, paidByUser.getOrDefault(payerId, BigDecimal.ZERO).add(amt));
        }

        int participantCount = Math.max(1, participants.size());
        BigDecimal equalShare = totalSpent.divide(BigDecimal.valueOf(participantCount), 2, java.math.RoundingMode.HALF_UP);

        List<com.tripnest.dto.ExpenseSplitResponse.MemberBalance> balances = new ArrayList<>();
        // For settlement calculation: Creditors (positive balance) and Debtors (negative balance)
        List<double[]> debtors = new ArrayList<>();
        List<double[]> creditors = new ArrayList<>();

        for (Map.Entry<Long, User> entry : participants.entrySet()) {
            Long uid = entry.getKey();
            User u = entry.getValue();
            BigDecimal paid = paidByUser.getOrDefault(uid, BigDecimal.ZERO);
            BigDecimal net = paid.subtract(equalShare);

            String status = "SETTLED";
            if (net.compareTo(BigDecimal.valueOf(0.01)) > 0) status = "GETS_BACK";
            else if (net.compareTo(BigDecimal.valueOf(-0.01)) < 0) status = "OWES";

            String fullName = ((u.getFirstName() != null ? u.getFirstName() : "") + " " +
                    (u.getLastName() != null ? u.getLastName() : "")).trim();
            if (fullName.isEmpty()) fullName = u.getUsername();

            balances.add(new com.tripnest.dto.ExpenseSplitResponse.MemberBalance(
                    uid, u.getUsername(), fullName, paid, net, status
            ));

            if (net.doubleValue() < -0.01) {
                debtors.add(new double[]{uid, -net.doubleValue()});
            } else if (net.doubleValue() > 0.01) {
                creditors.add(new double[]{uid, net.doubleValue()});
            }
        }

        // Greedy two-pointer debt settlement simplification algorithm
        List<com.tripnest.dto.ExpenseSplitResponse.SettlementTransaction> settlements = new ArrayList<>();
        int d = 0, c = 0;
        while (d < debtors.size() && c < creditors.size()) {
            double[] debtor = debtors.get(d);
            double[] creditor = creditors.get(c);

            double settleAmt = Math.min(debtor[1], creditor[1]);
            User fromUser = participants.get((long) debtor[0]);
            User toUser = participants.get((long) creditor[0]);

            String fromName = ((fromUser.getFirstName() != null ? fromUser.getFirstName() : "") + " " +
                    (fromUser.getLastName() != null ? fromUser.getLastName() : "")).trim();
            if (fromName.isEmpty()) fromName = fromUser.getUsername();

            String toName = ((toUser.getFirstName() != null ? toUser.getFirstName() : "") + " " +
                    (toUser.getLastName() != null ? toUser.getLastName() : "")).trim();
            if (toName.isEmpty()) toName = toUser.getUsername();

            settlements.add(new com.tripnest.dto.ExpenseSplitResponse.SettlementTransaction(
                    fromUser.getUsername(), fromName,
                    toUser.getUsername(), toName,
                    BigDecimal.valueOf(settleAmt).setScale(2, java.math.RoundingMode.HALF_UP)
            ));

            debtor[1] -= settleAmt;
            creditor[1] -= settleAmt;

            if (debtor[1] < 0.01) d++;
            if (creditor[1] < 0.01) c++;
        }

        return com.tripnest.dto.ExpenseSplitResponse.builder()
                .tripId(tripId)
                .tripTitle(trip.getTitle())
                .totalTripSpent(totalSpent)
                .totalMembers(participantCount)
                .equalSharePerMember(equalShare)
                .memberBalances(balances)
                .suggestedSettlements(settlements)
                .build();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void applyRequest(Expense expense, ExpenseRequest req) {
        expense.setCategory(req.getCategory());
        expense.setAmount(req.getAmount());
        expense.setDescription(req.getDescription());
        expense.setExpenseDate(req.getExpenseDate());
    }

    public ExpenseResponse toResponse(Expense expense) {
        ExpenseResponse res = new ExpenseResponse();
        res.setId(expense.getId());
        res.setTripId(expense.getTrip().getId());
        res.setUserId(expense.getUser().getId());
        res.setUsername(expense.getUser().getUsername());
        res.setCategory(expense.getCategory());
        res.setAmount(expense.getAmount());
        res.setDescription(expense.getDescription());
        res.setExpenseDate(expense.getExpenseDate());
        res.setCreatedAt(expense.getCreatedAt());
        return res;
    }
}
