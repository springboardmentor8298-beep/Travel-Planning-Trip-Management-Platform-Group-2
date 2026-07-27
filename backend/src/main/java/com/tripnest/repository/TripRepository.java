package com.tripnest.repository;

import com.tripnest.entity.Trip;
import com.tripnest.entity.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByOwnerIdOrderByStartDateAsc(Long ownerId);

    List<Trip> findByOwnerIdAndStatusOrderByStartDateAsc(Long ownerId, TripStatus status);

    Optional<Trip> findByIdAndOwnerId(Long id, Long ownerId);
}
