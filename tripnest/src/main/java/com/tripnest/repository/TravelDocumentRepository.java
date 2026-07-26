package com.tripnest.repository;

import com.tripnest.entity.TravelDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelDocumentRepository extends JpaRepository<TravelDocument, Long> {
    
    List<TravelDocument> findByTripIdOrderByUploadedAtDesc(Long tripId);
    
    List<TravelDocument> findByUserIdOrderByUploadedAtDesc(Long userId);
    
    List<TravelDocument> findByTripIdAndDocumentTypeOrderByUploadedAtDesc(Long tripId, String documentType);
}
