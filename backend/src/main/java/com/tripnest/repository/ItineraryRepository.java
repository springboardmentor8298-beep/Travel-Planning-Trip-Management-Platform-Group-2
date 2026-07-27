package com.tripnest.repository;

import com.tripnest.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    List<Itinerary> findByTripIdOrderByDayNumberAsc(Long tripId);

    Optional<Itinerary> findByIdAndTripId(Long id, Long tripId);

    boolean existsByTripIdAndDayNumber(Long tripId, Integer dayNumber);

    long countByTripId(Long tripId);

    void deleteByTripId(Long tripId);
}
