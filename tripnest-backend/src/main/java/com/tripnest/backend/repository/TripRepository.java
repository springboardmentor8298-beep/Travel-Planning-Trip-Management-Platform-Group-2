package com.tripnest.backend.repository;

import com.tripnest.backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.User;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByUserId(Long userId);
    List<Trip> findByUser(User user);

}