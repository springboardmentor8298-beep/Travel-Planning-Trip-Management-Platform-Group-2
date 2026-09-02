package com.tripnest.controller;

import com.tripnest.dto.ExpenseAnalyticsDTO;
import com.tripnest.entity.Expense;
import com.tripnest.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    // Get all expenses or filter by tripId
    @GetMapping
    public List<Expense> getAllExpenses(@RequestParam(name = "tripId", required = false) Integer tripId) {
        if (tripId != null) {
            return expenseService.getExpensesByTripId(tripId);
        }
        return expenseService.getAllExpenses();
    }

    // Get expense analytics / summary
    @GetMapping("/analytics")
    public ResponseEntity<ExpenseAnalyticsDTO> getExpenseAnalytics(@RequestParam(name = "tripId", required = false) Integer tripId) {
        ExpenseAnalyticsDTO analytics = expenseService.getExpenseAnalytics(tripId);
        return ResponseEntity.ok(analytics);
    }

    // Get expense by ID
    @GetMapping("/{id}")
    public Optional<Expense> getExpenseById(@PathVariable Integer id) {
        return expenseService.getExpenseById(id);
    }

    // Create expense
    @PostMapping
    public Expense saveExpense(@RequestBody Expense expense) {
        return expenseService.saveExpense(expense);
    }

    // Update expense
    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Integer id,
                                 @RequestBody Expense expense) {

        expense.setExpenseId(id);
        return expenseService.updateExpense(expense);
    }

    // Delete expense
    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Integer id) {

        expenseService.deleteExpense(id);
        return "Expense deleted successfully!";
    }
}