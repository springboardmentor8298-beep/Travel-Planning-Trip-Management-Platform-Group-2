package com.tripnest.repository;

import com.tripnest.model.TravelGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TravelGroupRepository extends JpaRepository<TravelGroup, Long> {

    /** Groups owned by the user */
    List<TravelGroup> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    /** Groups where the user is a member (not owner) */
    @Query("SELECT g FROM TravelGroup g JOIN g.members m WHERE m.id = :userId ORDER BY g.createdAt DESC")
    List<TravelGroup> findByMemberId(@Param("userId") Long userId);

    /** All groups the user is involved in (owner OR member) */
    @Query("""
        SELECT DISTINCT g FROM TravelGroup g
        LEFT JOIN g.members m
        WHERE g.owner.id = :userId OR m.id = :userId
        ORDER BY g.createdAt DESC
    """)
    List<TravelGroup> findAllForUser(@Param("userId") Long userId);
}
