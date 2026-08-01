package com.tripnest.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TripRepository extends JpaRepository<Trip, Long>, JpaSpecificationExecutor<Trip> {

    List<Trip> findByUser(User user);

    Optional<Trip> findByIdAndUser(Long id, User user);
}