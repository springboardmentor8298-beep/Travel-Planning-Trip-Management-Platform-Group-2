package com.tripnest.repository;

import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByTrip(Trip trip);
    Optional<Itinerary> findByIdAndTrip(Long id, Trip trip);
    List<Itinerary> findByTripOrderByDateAsc(Trip trip);
}
