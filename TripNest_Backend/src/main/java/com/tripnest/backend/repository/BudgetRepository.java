package com.tripnest.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.tripnest.backend.entity.Budget;
import java.math.BigDecimal;

public interface BudgetRepository extends JpaRepository<Budget,Long>  {

    @Query("SELECT SUM(b.totalBudget) FROM Budget b")
    BigDecimal sumTotalBudget();
}
