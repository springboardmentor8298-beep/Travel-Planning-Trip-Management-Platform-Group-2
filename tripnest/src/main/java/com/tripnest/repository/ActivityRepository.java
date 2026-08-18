package com.tripnest.repository;

import com.tripnest.entity.Activity;
import com.tripnest.entity.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    // All activities of an itinerary
    List<Activity> findByItineraryIdOrderByStartTimeAsc(Long itineraryId);

    // Activities by type
    List<Activity> findByItineraryIdAndType(Long itineraryId, ActivityType type);

    // Activities between two times
    List<Activity> findByItineraryIdAndStartTimeBetween(
            Long itineraryId,
            LocalTime start,
            LocalTime end
    );

    // Delete all activities of an itinerary
    void deleteByItineraryId(Long itineraryId);

}