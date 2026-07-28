package com.tripnest.repository;

import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUser(User user);
    Optional<Trip> findByIdAndUser(Long id, User user);
    List<Trip> findByUserAndStatus(User user, String status);
}
