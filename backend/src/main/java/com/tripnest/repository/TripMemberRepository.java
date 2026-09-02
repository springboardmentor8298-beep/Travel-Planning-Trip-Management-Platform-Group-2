package com.tripnest.repository;

import com.tripnest.entity.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, Integer> {
    List<TripMember> findByTrip_TripId(Integer tripId);
    List<TripMember> findByUser_UserId(Integer userId);
    Optional<TripMember> findByTrip_TripIdAndUser_UserId(Integer tripId, Integer userId);
    boolean existsByTrip_TripIdAndUser_UserId(Integer tripId, Integer userId);
    void deleteByTrip_TripIdAndUser_UserId(Integer tripId, Integer userId);
}
