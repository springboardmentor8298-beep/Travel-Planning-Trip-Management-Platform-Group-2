package com.tripnest.repository;

import com.tripnest.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    List<Activity> findByItinerary_ItineraryIdOrderByActivityTimeAsc(Integer itineraryId);
    List<Activity> findByItinerary_Trip_TripId(Integer tripId);
}