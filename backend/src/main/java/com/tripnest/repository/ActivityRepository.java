package com.tripnest.repository;

import com.tripnest.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByItineraryIdOrderByStartTimeAsc(Long itineraryId);

    Optional<Activity> findByIdAndItineraryId(Long id, Long itineraryId);

    long countByItineraryId(Long itineraryId);
}
