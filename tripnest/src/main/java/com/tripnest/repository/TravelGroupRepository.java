package com.tripnest.repository;

import com.tripnest.entity.TravelGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelGroupRepository extends JpaRepository<TravelGroup, Long> {
    
    List<TravelGroup> findByAdminIdOrderByCreatedAtDesc(Long adminId);
    
    @Query("SELECT DISTINCT g FROM TravelGroup g LEFT JOIN FETCH g.members WHERE g.admin.id = :userId ORDER BY g.createdAt DESC")
    List<TravelGroup> findGroupsByAdminIdWithMembers(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT g FROM TravelGroup g LEFT JOIN FETCH g.members LEFT JOIN FETCH g.admin WHERE g.admin.id = :userId ORDER BY g.createdAt DESC")
    List<TravelGroup> findAllAccessibleGroups(@Param("userId") Long userId);

    /**
     * Finds all groups where the user is a member (via group_members join table).
     * This includes groups the user did NOT create.
     */
    @Query("SELECT DISTINCT g FROM TravelGroup g JOIN g.members m WHERE m.user.id = :userId ORDER BY g.createdAt DESC")
    List<TravelGroup> findGroupsByMemberUserId(@Param("userId") Long userId);

    /**
     * Finds a TravelGroup linked to a specific trip.
     */
    Optional<TravelGroup> findByTripId(Long tripId);
}
