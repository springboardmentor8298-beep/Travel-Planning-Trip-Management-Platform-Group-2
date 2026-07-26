package com.tripnest.repository;

import com.tripnest.entity.Expense;
import com.tripnest.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByTripIdOrderByExpenseDateDesc(Long tripId);
    
    List<Expense> findByTripIdAndCategoryOrderByExpenseDateDesc(Long tripId, ExpenseCategory category);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.trip.id = :tripId")
    BigDecimal getTotalExpensesByTripId(@Param("tripId") Long tripId);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.trip.id = :tripId AND e.category = :category")
    BigDecimal getTotalExpensesByTripIdAndCategory(@Param("tripId") Long tripId, @Param("category") ExpenseCategory category);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.trip.id = :tripId GROUP BY e.category")
    List<Object[]> getExpensesByCategoryForTrip(@Param("tripId") Long tripId);
    
    @Query("SELECT e FROM Expense e WHERE e.trip.id = :tripId AND e.expenseDate BETWEEN :startDate AND :endDate ORDER BY e.expenseDate")
    List<Expense> findByTripIdAndDateRange(@Param("tripId") Long tripId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);

    List<Expense> findByTravelGroupIdOrderByExpenseDateDesc(Long groupId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.travelGroup.id = :groupId")
    BigDecimal getTotalExpensesByGroupId(@Param("groupId") Long groupId);
}
