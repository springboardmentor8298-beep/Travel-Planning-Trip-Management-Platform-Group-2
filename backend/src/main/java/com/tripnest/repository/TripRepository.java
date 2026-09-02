package com.tripnest.repository;

import com.tripnest.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByUser_UserId(Integer userId);

    @Query("SELECT DISTINCT t FROM Trip t WHERE t.user.userId = :userId OR t.tripId IN (SELECT tm.trip.tripId FROM TripMember tm WHERE tm.user.userId = :userId)")
    List<Trip> findAllUserAndSharedTrips(@Param("userId") Integer userId);
}