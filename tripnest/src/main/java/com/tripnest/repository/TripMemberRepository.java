package com.tripnest.repository;

import com.tripnest.entity.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, Long> {

    List<TripMember> findByTripId(Long tripId);

    Optional<TripMember> findByTripIdAndUserId(Long tripId, Long userId);

    boolean existsByTripIdAndUserId(Long tripId, Long userId);

    void deleteByTripIdAndUserId(Long tripId, Long userId);
}