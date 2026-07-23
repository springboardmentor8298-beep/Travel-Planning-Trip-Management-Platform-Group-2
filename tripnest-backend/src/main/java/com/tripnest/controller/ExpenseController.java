package com.tripnest.controller;

import com.tripnest.model.Expense;
import com.tripnest.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expense")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping("/add")
    public Expense add(@RequestBody Expense expense) {
        return expenseService.save(expense);
    }

    @GetMapping("/all")
    public List<Expense> getAll() {
        return expenseService.getAll();
    }
}