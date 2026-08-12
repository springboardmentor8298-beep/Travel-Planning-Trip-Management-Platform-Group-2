package com.tripnest.backend.repository;

import java.util.List;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.entity.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByBudget(Budget budget);

    @Query("SELECT SUM(e.amount) FROM Expense e")
    BigDecimal sumTotalExpenses();
}