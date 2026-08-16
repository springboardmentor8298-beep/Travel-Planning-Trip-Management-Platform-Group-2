package com.tripnest.repository;

import com.tripnest.entity.TripMemberRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripMemberRoleRepository extends JpaRepository<TripMemberRole, Long> {
    List<TripMemberRole> findByTripId(Long tripId);
    Optional<TripMemberRole> findByTripIdAndUserId(Long tripId, Long userId);
}
