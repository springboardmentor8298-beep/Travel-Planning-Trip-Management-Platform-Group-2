package com.tripnest.service;

import com.tripnest.dto.BudgetRequest;
import com.tripnest.dto.BudgetResponse;
import com.tripnest.entity.Budget;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final TripRepository tripRepository;

    public BudgetService(BudgetRepository budgetRepository, TripRepository tripRepository) {
        this.budgetRepository = budgetRepository;
        this.tripRepository = tripRepository;
    }

    public BudgetResponse getBudgetByTripId(Long tripId) {
        validateTripOwnership(tripId);
        Budget budget = budgetRepository.findByTripId(tripId).orElse(null);
        if (budget == null) return null;
        return toResponse(budget);
    }

    public BudgetResponse createOrUpdateBudget(BudgetRequest request) {
        Trip trip = validateTripOwnership(request.getTripId());

        Budget budget = budgetRepository.findByTripId(request.getTripId())
                .orElse(new Budget());

        budget.setTrip(trip);
        budget.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() :
                (request.getAccommodation() != null ? request.getAccommodation() : BigDecimal.ZERO)
                .add(request.getTransportation() != null ? request.getTransportation() : BigDecimal.ZERO)
                .add(request.getFood() != null ? request.getFood() : BigDecimal.ZERO)
                .add(request.getActivities() != null ? request.getActivities() : BigDecimal.ZERO)
                .add(request.getOther() != null ? request.getOther() : BigDecimal.ZERO));
        budget.setAccommodation(request.getAccommodation() != null ? request.getAccommodation() : BigDecimal.ZERO);
        budget.setTransportation(request.getTransportation() != null ? request.getTransportation() : BigDecimal.ZERO);
        budget.setFood(request.getFood() != null ? request.getFood() : BigDecimal.ZERO);
        budget.setActivities(request.getActivities() != null ? request.getActivities() : BigDecimal.ZERO);
        budget.setOther(request.getOther() != null ? request.getOther() : BigDecimal.ZERO);
        budget.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");

        return toResponse(budgetRepository.save(budget));
    }

    public void deleteBudget(Long tripId) {
        validateTripOwnership(tripId);
        budgetRepository.deleteByTripId(tripId);
    }

    private Trip validateTripOwnership(Long tripId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        return trip;
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
