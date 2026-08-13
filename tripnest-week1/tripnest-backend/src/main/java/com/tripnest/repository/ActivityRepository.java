package com.tripnest.repository;

import com.tripnest.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByItineraryIdOrderByScheduledTimeAsc(Long itineraryId);
}
