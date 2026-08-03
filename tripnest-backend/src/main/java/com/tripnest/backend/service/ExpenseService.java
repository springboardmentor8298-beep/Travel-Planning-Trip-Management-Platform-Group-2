package com.tripnest.backend.service;

import java.util.List;

import com.tripnest.backend.entity.Expense;

public interface ExpenseService {

    Expense createExpense(Expense expense);

    List<Expense> getExpensesByTrip(Long tripId);

    Expense getExpenseById(Long id);

    Expense updateExpense(Long id, Expense expense);

    void deleteExpense(Long id);

}