package com.tripnest.backend.controller;

import com.tripnest.backend.model.ExpenseEntity;
import com.tripnest.backend.model.SettlementEntity;
import com.tripnest.backend.model.TripEntity;
import com.tripnest.backend.model.UserEntity;
import com.tripnest.backend.repository.ExpenseRepository;
import com.tripnest.backend.repository.SettlementRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ExpenseEntity>> getExpenses(@PathVariable String tripId) {
        return ResponseEntity.ok(expenseRepository.findByTripId(tripId));
    }

    @PostMapping
    public ResponseEntity<?> addExpense(@PathVariable String tripId, @RequestBody Map<String, Object> body) {
        ExpenseEntity exp = new ExpenseEntity();
        exp.setId("exp_" + UUID.randomUUID().toString().substring(0, 8));
        exp.setTripId(tripId);
        exp.setTitle(body.containsKey("title") ? body.get("title").toString() : "Trip Expense");
        exp.setAmount(body.containsKey("amount") ? Double.parseDouble(body.get("amount").toString()) : 0.0);
        exp.setCategory(body.containsKey("category") ? body.get("category").toString() : "Miscellaneous");
        exp.setCurrency(body.containsKey("currency") ? body.get("currency").toString() : "INR");
        exp.setPaidBy(body.containsKey("paidBy") ? body.get("paidBy").toString() : "Organizer");
        exp.setDate(body.containsKey("date") ? body.get("date").toString() : new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date()));

        ExpenseEntity saved = expenseRepository.save(exp);

        // Update trip total spent budget
        Optional<TripEntity> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isPresent()) {
            TripEntity trip = tripOpt.get();
            List<ExpenseEntity> all = expenseRepository.findByTripId(tripId);
            double totalSpent = all.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();
            trip.setSpentBudget(totalSpent);
            tripRepository.save(trip);
        }

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable String tripId, @PathVariable String id) {
        expenseRepository.deleteById(id);

        Optional<TripEntity> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isPresent()) {
            TripEntity trip = tripOpt.get();
            List<ExpenseEntity> all = expenseRepository.findByTripId(tripId);
            double totalSpent = all.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();
            trip.setSpentBudget(totalSpent);
            tripRepository.save(trip);
        }

        return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@PathVariable String tripId) {
        List<ExpenseEntity> expenses = expenseRepository.findByTripId(tripId);
        double totalSpent = expenses.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();

        double totalBudget = 2000.0;
        Optional<TripEntity> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isPresent() && tripOpt.get().getTotalBudget() != null) {
            totalBudget = tripOpt.get().getTotalBudget();
        }

        Map<String, Double> categoryBreakdown = new HashMap<>();
        for (ExpenseEntity e : expenses) {
            String cat = e.getCategory() != null ? e.getCategory() : "Miscellaneous";
            categoryBreakdown.put(cat, categoryBreakdown.getOrDefault(cat, 0.0) + (e.getAmount() != null ? e.getAmount() : 0.0));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalBudget", totalBudget);
        response.put("totalSpent", totalSpent);
        response.put("remainingBudget", Math.max(0, totalBudget - totalSpent));
        response.put("categoryBreakdown", categoryBreakdown);
        response.put("overBudget", totalBudget > 0 && totalSpent > totalBudget);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/settlements")
    public ResponseEntity<?> getSettlements(@PathVariable String tripId) {
        List<ExpenseEntity> expenses = expenseRepository.findByTripId(tripId);
        List<SettlementEntity> settlementsList = settlementRepository.findByTripIdOrderByCreatedAtDesc(tripId);

        Optional<TripEntity> tripOpt = tripRepository.findById(tripId);
        int memberCount = 1;
        List<String> memberNames = new ArrayList<>();

        if (tripOpt.isPresent()) {
            TripEntity trip = tripOpt.get();
            String ownerEmail = trip.getOwnerEmail();
            String ownerName = "Organizer";
            if (ownerEmail != null && !ownerEmail.isBlank()) {
                Optional<UserEntity> ownerOpt = userRepository.findByEmail(ownerEmail.trim().toLowerCase());
                if (ownerOpt.isPresent() && ownerOpt.get().getName() != null && !ownerOpt.get().getName().isBlank()) {
                    ownerName = ownerOpt.get().getName();
                } else {
                    ownerName = ownerEmail.contains("@") ? ownerEmail.split("@")[0] : ownerEmail;
                }
            }
            memberNames.add(ownerName);

            String shared = trip.getSharedMembers();
            if (shared != null && !shared.isBlank()) {
                String[] parts = shared.split(",");
                for (String p : parts) {
                    String clean = p.trim().toLowerCase();
                    if (clean.isBlank()) continue;
                    Optional<UserEntity> uOpt = userRepository.findByEmail(clean);
                    String name = clean.contains("@") ? clean.split("@")[0] : clean;
                    if (uOpt.isPresent() && uOpt.get().getName() != null && !uOpt.get().getName().isBlank()) {
                        name = uOpt.get().getName();
                    }
                    if (!memberNames.contains(name)) {
                        memberNames.add(name);
                    }
                }
            }
            memberCount = Math.max(memberNames.size(), trip.getMemberCount() != null ? trip.getMemberCount() : 1);
        } else {
            memberNames.add("Organizer");
        }

        double totalSpent = expenses.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();
        double perPersonShare = memberCount > 0 ? totalSpent / memberCount : totalSpent;

        // Calculate paid amounts per member
        Map<String, Double> paidMap = new HashMap<>();
        for (String m : memberNames) {
            paidMap.put(m, 0.0);
        }

        for (ExpenseEntity e : expenses) {
            String paidBy = e.getPaidBy() != null ? e.getPaidBy().trim() : memberNames.get(0);
            // Match closest member name or default to first member
            String matched = memberNames.stream()
                    .filter(m -> m.equalsIgnoreCase(paidBy) || paidBy.toLowerCase().contains(m.toLowerCase()) || m.toLowerCase().contains(paidBy.toLowerCase()))
                    .findFirst()
                    .orElse(memberNames.get(0));

            paidMap.put(matched, paidMap.getOrDefault(matched, 0.0) + (e.getAmount() != null ? e.getAmount() : 0.0));
        }

        // Adjust paid amounts for Settlements
        Map<String, Double> settlementAdjustments = new HashMap<>();
        for (String m : memberNames) {
            settlementAdjustments.put(m, 0.0);
        }

        for (SettlementEntity s : settlementsList) {
            double amt = s.getAmount() != null ? s.getAmount() : 0.0;
            String payer = s.getPayerName();
            String payee = s.getPayeeName();

            if (payer != null) {
                String matchedPayer = memberNames.stream().filter(m -> m.equalsIgnoreCase(payer)).findFirst().orElse(payer);
                settlementAdjustments.put(matchedPayer, settlementAdjustments.getOrDefault(matchedPayer, 0.0) + amt);
            }
            if (payee != null) {
                String matchedPayee = memberNames.stream().filter(m -> m.equalsIgnoreCase(payee)).findFirst().orElse(payee);
                settlementAdjustments.put(matchedPayee, settlementAdjustments.getOrDefault(matchedPayee, 0.0) - amt);
            }
        }

        List<Map<String, Object>> balances = new ArrayList<>();
        double totalSettledAmount = 0.0;

        for (int i = 0; i < memberNames.size(); i++) {
            String person = memberNames.get(i);
            double paid = paidMap.getOrDefault(person, 0.0);
            double settledAdj = settlementAdjustments.getOrDefault(person, 0.0);
            double netBalance = (paid - perPersonShare) + settledAdj;

            balances.add(Map.of(
                    "person", person,
                    "role", i == 0 ? "Trip Organizer" : "Co-Traveler",
                    "totalPaid", paid,
                    "share", perPersonShare,
                    "netBalance", Math.round(netBalance * 100.0) / 100.0,
                    "status", netBalance >= 0 ? "TO_RECEIVE" : "TO_PAY"
            ));
        }

        totalSettledAmount = settlementsList.stream().mapToDouble(s -> s.getAmount() != null ? s.getAmount() : 0.0).sum();

        return ResponseEntity.ok(Map.of(
                "totalSpent", totalSpent,
                "memberCount", memberCount,
                "perPersonShare", Math.round(perPersonShare * 100.0) / 100.0,
                "totalSettledAmount", totalSettledAmount,
                "balances", balances,
                "settlementsHistory", settlementsList
        ));
    }

    @PostMapping("/settle")
    public ResponseEntity<?> settleUp(@PathVariable String tripId, @RequestBody Map<String, Object> body) {
        String payerName = body.getOrDefault("payerName", body.getOrDefault("person", "Co-Traveler")).toString();
        String payeeName = body.getOrDefault("payeeName", "Trip Organizer").toString();
        Double amount = body.containsKey("amount") ? Double.parseDouble(body.get("amount").toString()) : 0.0;
        String paymentMethod = body.getOrDefault("paymentMethod", "UPI / Cash").toString();
        String notes = body.getOrDefault("notes", "Settlement Payment").toString();

        SettlementEntity settlement = new SettlementEntity(
                "settle_" + UUID.randomUUID().toString().substring(0, 8),
                tripId,
                payerName,
                payeeName,
                amount,
                paymentMethod,
                notes
        );

        SettlementEntity saved = settlementRepository.save(settlement);

        return ResponseEntity.ok(Map.of(
                "message", "Payment settlement of ₹" + amount + " logged successfully from " + payerName + " to " + payeeName + "!",
                "settlement", saved
        ));
    }

    @DeleteMapping("/settle/{settlementId}")
    public ResponseEntity<?> deleteSettlement(@PathVariable String tripId, @PathVariable String settlementId) {
        settlementRepository.deleteById(settlementId);
        return ResponseEntity.ok(Map.of("message", "Settlement record undone successfully"));
    }
}
