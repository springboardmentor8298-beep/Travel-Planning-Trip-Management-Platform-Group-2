package com.tripnest.service;

import com.tripnest.dto.BudgetRequest;
import com.tripnest.dto.BudgetResponse;
import com.tripnest.dto.CategoryAllocationRequest;
import com.tripnest.dto.CategoryAllocationResponse;
import com.tripnest.entity.Budget;
import com.tripnest.entity.BudgetCategoryAllocation;
import com.tripnest.entity.Trip;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final TripAccessService tripAccessService;

    public BudgetResponse createOrUpdateBudget(String email, Long tripId, BudgetRequest request) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertCanEdit(email, trip);

        Budget budget = budgetRepository.findByTripId(tripId).orElseGet(() ->
                Budget.builder().trip(trip).totalBudget(request.getTotalBudget()).build()
        );
        budget.setTotalBudget(request.getTotalBudget());

        // Replace category allocations wholesale on each update - simplest
        // correct behavior for a beginner-friendly budget editor UI.
        budget.getCategoryAllocations().clear();
        if (request.getCategoryAllocations() != null) {
            for (CategoryAllocationRequest allocReq : request.getCategoryAllocations()) {
                budget.getCategoryAllocations().add(
                        BudgetCategoryAllocation.builder()
                                .budget(budget)
                                .category(allocReq.getCategory())
                                .allocatedAmount(allocReq.getAllocatedAmount())
                                .build()
                );
            }
        }

        // Keep Trip.budget (Milestone 2's simple field) in sync so the
        // existing Trip dashboard and TripResponse keep showing a sensible number.
        trip.setBudget(request.getTotalBudget());

        budgetRepository.save(budget);
        return toResponse(budget);
    }

    public BudgetResponse getBudget(String email, Long tripId) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertHasAccess(email, trip);

        Budget budget = budgetRepository.findByTripId(tripId)
                .orElseThrow(() -> new IllegalArgumentException("No budget set for this trip yet"));

        return toResponse(budget);
    }

    private BudgetResponse toResponse(Budget budget) {
        Long tripId = budget.getTrip().getId();
        double totalSpent = expenseRepository.sumAmountByTripId(tripId);

        List<CategoryAllocationResponse> categoryResponses = new ArrayList<>();
        for (BudgetCategoryAllocation alloc : budget.getCategoryAllocations()) {
            double spentInCategory = expenseRepository.sumAmountByTripIdAndCategory(tripId, alloc.getCategory());
            categoryResponses.add(new CategoryAllocationResponse(
                    alloc.getCategory(),
                    alloc.getAllocatedAmount(),
                    spentInCategory,
                    alloc.getAllocatedAmount() - spentInCategory
            ));
        }

        return new BudgetResponse(
                budget.getId(),
                tripId,
                budget.getTotalBudget(),
                totalSpent,
                budget.getTotalBudget() - totalSpent,
                categoryResponses
        );
    }
}
