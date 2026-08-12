package com.tripnest.backend.repository;

import com.tripnest.backend.model.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, String> {
    List<ExpenseEntity> findByTripId(String tripId);
    void deleteByTripId(String tripId);
}
