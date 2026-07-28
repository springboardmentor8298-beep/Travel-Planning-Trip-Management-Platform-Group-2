package com.tripnest.repository;

import com.tripnest.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUserEmailOrderByStartDateAsc(String email);
    List<Trip> findByMembersUserEmailOrderByStartDateAsc(String email);
}
