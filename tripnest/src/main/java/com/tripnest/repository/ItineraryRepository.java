package com.tripnest.repository;

import com.tripnest.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    // Get all itinerary days for a trip
    List<Itinerary> findByTripIdOrderByDateAsc(Long tripId);

    // Find itinerary by trip and date
    Optional<Itinerary> findByTripIdAndDate(Long tripId, LocalDate date);

    // Check if a day already exists
    boolean existsByTripIdAndDate(Long tripId, LocalDate date);

    // Check duplicate date while updating
    boolean existsByTripIdAndDateAndIdNot(
            Long tripId,
            LocalDate date,
            Long id
    );
}