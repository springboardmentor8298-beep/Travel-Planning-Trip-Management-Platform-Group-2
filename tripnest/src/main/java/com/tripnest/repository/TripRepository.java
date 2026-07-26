package com.tripnest.repository;

import com.tripnest.entity.Trip;
import com.tripnest.entity.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Trip}.
 */
@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByUserIdOrderByStartDateDesc(Long userId);

    List<Trip> findByUserIdAndStatusOrderByStartDateDesc(Long userId, TripStatus status);

    Optional<Trip> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, TripStatus status);

    Optional<Trip> findByShareToken(String shareToken);
}
