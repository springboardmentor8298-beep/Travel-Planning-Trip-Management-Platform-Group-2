package com.tripnest.repository;

import com.tripnest.model.Trip;
import com.tripnest.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByOwnerOrderByStartDateAsc(User owner);
    List<Trip> findByOwnerIdOrTravelers_IdOrderByStartDateAsc(Long ownerId, Long travelerId);
}
