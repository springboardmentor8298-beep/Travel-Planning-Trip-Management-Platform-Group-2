package com.tripnest.service;

import com.tripnest.dto.BudgetRequest;
import com.tripnest.dto.BudgetResponse;
import com.tripnest.entity.Budget;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         TripRepository tripRepository,
                         UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    public BudgetResponse getBudgetByTripId(Long tripId) {
        Budget budget = budgetRepository.findByTripId(tripId).orElse(null);
        if (budget == null) return null;
        return toResponse(budget);
    }

    public BudgetResponse createOrUpdateBudget(BudgetRequest request) {
        if (request.getTripId() == null) {
            throw new RuntimeException("Trip ID is required");
        }
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        Budget budget = budgetRepository.findByTripId(request.getTripId())
                .orElse(new Budget());

        budget.setTrip(trip);
        BigDecimal acc = request.getAccommodation() != null ? request.getAccommodation() : BigDecimal.ZERO;
        BigDecimal trans = request.getTransportation() != null ? request.getTransportation() : BigDecimal.ZERO;
        BigDecimal food = request.getFood() != null ? request.getFood() : BigDecimal.ZERO;
        BigDecimal act = request.getActivities() != null ? request.getActivities() : BigDecimal.ZERO;
        BigDecimal other = request.getOther() != null ? request.getOther() : BigDecimal.ZERO;

        budget.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() :
                acc.add(trans).add(food).add(act).add(other));
        budget.setAccommodation(acc);
        budget.setTransportation(trans);
        budget.setFood(food);
        budget.setActivities(act);
        budget.setOther(other);
        budget.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");

        return toResponse(budgetRepository.save(budget));
    }

    public void deleteBudget(Long tripId) {
        budgetRepository.deleteByTripId(tripId);
    }

    private User getCurrentUserOrNull() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                return (User) auth.getPrincipal();
            }
        } catch (Exception ignored) {}
        return null;
    }

    private BudgetResponse toResponse(Budget b) {
        return new BudgetResponse(
                b.getId(),
                b.getTrip().getId(),
                b.getTotalAmount(),
                b.getAccommodation(),
                b.getTransportation(),
                b.getFood(),
                b.getActivities(),
                b.getOther(),
                b.getCurrency()
        );
    }
}
