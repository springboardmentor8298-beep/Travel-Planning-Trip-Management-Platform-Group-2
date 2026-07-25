package com.tripnest.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.entity.Trip;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    List<Itinerary> findByTripOrderByDayNumberAsc(Trip trip);
    
    Optional<Itinerary> findById(Long id);
}