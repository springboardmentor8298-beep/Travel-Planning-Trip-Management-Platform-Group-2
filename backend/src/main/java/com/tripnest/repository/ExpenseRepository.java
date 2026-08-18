package com.tripnest.repository;

import com.tripnest.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByTripIdOrderByExpenseDateDescCreatedAtDesc(Long tripId);
}
