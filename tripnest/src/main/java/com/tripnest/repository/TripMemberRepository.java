package com.tripnest.repository;

import com.tripnest.entity.MemberStatus;
import com.tripnest.entity.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, Long> {

    List<TripMember> findByTripId(Long tripId);

    List<TripMember> findByTripIdAndStatus(Long tripId, MemberStatus status);

    Optional<TripMember> findByTripIdAndUserId(Long tripId, Long userId);

    boolean existsByTripIdAndUserId(Long tripId, Long userId);

    /** All trips where this user has an accepted invite */
    List<TripMember> findByUserIdAndStatus(Long userId, MemberStatus status);
}
