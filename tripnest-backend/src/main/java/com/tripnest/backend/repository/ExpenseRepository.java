package com.tripnest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByTripId(Long tripId);

}