package com.tripnest.controller;

import com.tripnest.entity.Budget;
import com.tripnest.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    // Get all budgets or filter by tripId
    @GetMapping
    public List<Budget> getAllBudgets(@RequestParam(name = "tripId", required = false) Integer tripId) {
        if (tripId != null) {
            Optional<Budget> budget = budgetService.getBudgetByTripId(tripId);
            return budget.map(Collections::singletonList).orElse(Collections.emptyList());
        }
        return budgetService.getAllBudgets();
    }

    // Get budget by ID
    @GetMapping("/{id}")
    public Optional<Budget> getBudgetById(@PathVariable Integer id) {
        return budgetService.getBudgetById(id);
    }

    // Create budget
    @PostMapping
    public Budget saveBudget(@RequestBody Budget budget) {
        return budgetService.saveBudget(budget);
    }

    // Update budget
    @PutMapping("/{id}")
    public Budget updateBudget(@PathVariable Integer id,
                               @RequestBody Budget budget) {

        budget.setBudgetId(id);
        return budgetService.updateBudget(budget);
    }

    // Delete budget
    @DeleteMapping("/{id}")
    public String deleteBudget(@PathVariable Integer id) {

        budgetService.deleteBudget(id);
        return "Budget deleted successfully!";
    }
}