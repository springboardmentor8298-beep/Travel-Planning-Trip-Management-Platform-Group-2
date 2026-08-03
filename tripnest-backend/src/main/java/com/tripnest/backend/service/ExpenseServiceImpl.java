package com.tripnest.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.repository.ExpenseRepository;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository) {

        this.expenseRepository = expenseRepository;

    }

    @Override
    public Expense createExpense(Expense expense) {

        return expenseRepository.save(expense);

    }

    @Override
    public List<Expense> getExpensesByTrip(Long tripId) {

        return expenseRepository.findByTripId(tripId);

    }

    @Override
    public Expense getExpenseById(Long id) {

        return expenseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found"));

    }

    @Override
    public Expense updateExpense(Long id, Expense expense) {

        Expense existingExpense = getExpenseById(id);

        existingExpense.setTitle(expense.getTitle());
        existingExpense.setAmount(expense.getAmount());
        existingExpense.setCategory(expense.getCategory());
        existingExpense.setExpenseDate(expense.getExpenseDate());
        existingExpense.setNotes(expense.getNotes());
        existingExpense.setTrip(expense.getTrip());

        return expenseRepository.save(existingExpense);

    }

    @Override
    public void deleteExpense(Long id) {

        expenseRepository.deleteById(id);

    }

}