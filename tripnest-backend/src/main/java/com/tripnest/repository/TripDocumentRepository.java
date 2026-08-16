package com.tripnest.repository;

import com.tripnest.entity.TripDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripDocumentRepository extends JpaRepository<TripDocument, Long> {
    List<TripDocument> findByTripIdOrderByUploadedAtDesc(Long tripId);
}
