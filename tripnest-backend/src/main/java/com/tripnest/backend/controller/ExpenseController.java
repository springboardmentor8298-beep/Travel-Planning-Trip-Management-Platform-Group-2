package com.tripnest.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.service.ExpenseService;

@RestController
@RequestMapping("/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {

        this.expenseService = expenseService;

    }

    @PostMapping
    public Expense createExpense(@RequestBody Expense expense) {

        return expenseService.createExpense(expense);

    }

    @GetMapping("/trip/{tripId}")
    public List<Expense> getExpensesByTrip(@PathVariable Long tripId) {

        return expenseService.getExpensesByTrip(tripId);

    }

    @GetMapping("/{id}")
    public Expense getExpenseById(@PathVariable Long id) {

        return expenseService.getExpenseById(id);

    }

    @PutMapping("/{id}")
    public Expense updateExpense(
            @PathVariable Long id,
            @RequestBody Expense expense) {

        return expenseService.updateExpense(id, expense);

    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id) {

        expenseService.deleteExpense(id);

    }

}