package com.tripnest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tripnest.backend.entity.Document;
import com.tripnest.backend.entity.Trip;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByTrip(Trip trip);

    List<Document> findByTripId(Long tripId);
}
