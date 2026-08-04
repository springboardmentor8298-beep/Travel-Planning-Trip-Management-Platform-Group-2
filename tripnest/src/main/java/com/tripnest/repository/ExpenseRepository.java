package com.tripnest.repository;

import com.tripnest.entity.Expense;
import com.tripnest.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByTripIdOrderByExpenseDateDesc(Long tripId);

    List<Expense> findByTripIdAndCategoryOrderByExpenseDateDesc(Long tripId, ExpenseCategory category);

    Optional<Expense> findByIdAndTripId(Long id, Long tripId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.trip.id = :tripId")
    BigDecimal sumAmountByTripId(@Param("tripId") Long tripId);

    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.trip.id = :tripId GROUP BY e.category")
    List<Object[]> sumByCategory(@Param("tripId") Long tripId);
}
