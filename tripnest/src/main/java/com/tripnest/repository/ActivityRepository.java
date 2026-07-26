package com.tripnest.repository;

import com.tripnest.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Activity}.
 */
@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByItineraryIdOrderByStartTimeAsc(Long itineraryId);

    Optional<Activity> findByIdAndItineraryId(Long id, Long itineraryId);
}
