package com.tripnest.repository;

import com.tripnest.entity.TravelGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelGroupRepository extends JpaRepository<TravelGroup, Long> {
    
    List<TravelGroup> findByAdminIdOrderByCreatedAtDesc(Long adminId);
    
    @Query("SELECT g FROM TravelGroup g JOIN g.members m WHERE m.user.id = :userId ORDER BY g.createdAt DESC")
    List<TravelGroup> findGroupsByMemberId(@Param("userId") Long userId);
    
    @Query("SELECT g FROM TravelGroup g WHERE g.admin.id = :userId OR EXISTS (SELECT m FROM g.members m WHERE m.user.id = :userId)")
    List<TravelGroup> findAllAccessibleGroups(@Param("userId") Long userId);
}
