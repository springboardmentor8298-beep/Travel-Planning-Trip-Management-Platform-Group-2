package com.tripnest.repository;

import com.tripnest.model.TravelDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TravelDocumentRepository extends JpaRepository<TravelDocument, Long> {
    List<TravelDocument> findByTripIdOrderByUploadedAtDesc(Long tripId);
}
