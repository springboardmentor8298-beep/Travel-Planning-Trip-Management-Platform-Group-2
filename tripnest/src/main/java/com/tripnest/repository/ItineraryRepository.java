package com.tripnest.repository;

import com.tripnest.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Itinerary}.
 */
@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    List<Itinerary> findByTripIdOrderByDayNumberAsc(Long tripId);

    Optional<Itinerary> findByIdAndTripId(Long id, Long tripId);

    void deleteByTripId(Long tripId);
}
