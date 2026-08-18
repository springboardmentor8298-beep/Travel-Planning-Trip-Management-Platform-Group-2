package com.tripnest.repository;

import com.tripnest.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByTripIdOrderByDayNumberAsc(Long tripId);
}
