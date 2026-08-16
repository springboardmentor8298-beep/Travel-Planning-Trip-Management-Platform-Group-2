package com.tripnest.repository;

import com.tripnest.entity.Expense;
import com.tripnest.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByTripIdOrderByExpenseDateDesc(Long tripId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.trip.id = :tripId")
    Double sumAmountByTripId(@Param("tripId") Long tripId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.trip.id = :tripId AND e.category = :category")
    Double sumAmountByTripIdAndCategory(@Param("tripId") Long tripId, @Param("category") ExpenseCategory category);
}
