package com.tripnest.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.TripMember;
import com.tripnest.backend.entity.User;

public interface TripMemberRepository extends JpaRepository<TripMember, Long> {

    List<TripMember> findByTrip(Trip trip);

    List<TripMember> findByTripId(Long tripId);

    List<TripMember> findByUser(User user);

    List<TripMember> findByUserAndStatus(User user, String status);

    List<TripMember> findByEmailAndStatus(String email, String status);

    Optional<TripMember> findByTripAndEmail(Trip trip, String email);

    Optional<TripMember> findByTripIdAndEmail(Long tripId, String email);

    Optional<TripMember> findByTripAndUser(Trip trip, User user);

    Optional<TripMember> findByTripIdAndUserId(Long tripId, Long userId);
}
