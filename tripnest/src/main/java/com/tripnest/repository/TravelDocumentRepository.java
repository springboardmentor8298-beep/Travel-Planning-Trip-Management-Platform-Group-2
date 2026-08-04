package com.tripnest.repository;

import com.tripnest.entity.DocumentType;
import com.tripnest.entity.TravelDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelDocumentRepository extends JpaRepository<TravelDocument, Long> {

    List<TravelDocument> findByTripIdOrderByUploadedAtDesc(Long tripId);

    List<TravelDocument> findByTripIdAndDocType(Long tripId, DocumentType docType);

    Optional<TravelDocument> findByIdAndTripId(Long id, Long tripId);
}
