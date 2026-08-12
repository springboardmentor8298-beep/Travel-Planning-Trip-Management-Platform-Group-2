package com.tripnest.backend.repository;

import com.tripnest.backend.model.SettlementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SettlementRepository extends JpaRepository<SettlementEntity, String> {
    List<SettlementEntity> findByTripIdOrderByCreatedAtDesc(String tripId);
}
