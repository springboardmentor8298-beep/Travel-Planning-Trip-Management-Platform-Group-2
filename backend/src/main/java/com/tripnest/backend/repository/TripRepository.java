package com.tripnest.backend.repository;

import com.tripnest.backend.model.TripEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<TripEntity, String> {
    List<TripEntity> findByIsCompleted(Boolean isCompleted);
    List<TripEntity> findByOwnerEmail(String ownerEmail);
}
