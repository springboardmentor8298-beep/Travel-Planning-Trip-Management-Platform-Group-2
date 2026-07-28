package com.tripnest.repository;

import com.tripnest.entity.Activity;
import com.tripnest.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByItinerary(Itinerary itinerary);
    Optional<Activity> findByIdAndItinerary(Long id, Itinerary itinerary);
    List<Activity> findByItineraryOrderByStartTimeAsc(Itinerary itinerary);
}
