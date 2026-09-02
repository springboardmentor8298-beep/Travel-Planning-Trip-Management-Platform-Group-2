package com.tripnest.repository;

import com.tripnest.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    // Trips the user owns OR has been added to as a traveler
    @Query("SELECT DISTINCT t FROM Trip t LEFT JOIN t.travelers tr " +
           "WHERE t.owner.id = :userId OR tr.id = :userId")
    List<Trip> findAllAccessibleByUser(@Param("userId") Long userId);
}
