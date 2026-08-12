package com.tripnest.backend.repository;

import com.tripnest.backend.model.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, String> {
    List<DocumentEntity> findByTripId(String tripId);
    void deleteByTripId(String tripId);
}
