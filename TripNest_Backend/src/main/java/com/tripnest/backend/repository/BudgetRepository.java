package com.tripnest.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.Budget;

public interface BudgetRepository extends JpaRepository<Budget,Long>  {

	
}
