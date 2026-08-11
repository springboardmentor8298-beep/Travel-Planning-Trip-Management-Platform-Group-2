package com.tripnest.repository;

import com.tripnest.entity.BudgetShare;
import com.tripnest.entity.TravelGroup;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetShareRepository extends JpaRepository<BudgetShare, Long> {
    
    List<BudgetShare> findByTripId(Long tripId);
    
    List<BudgetShare> findByUserId(Long userId);
    
    List<BudgetShare> findByTravelGroupId(Long groupId);
    
    Optional<BudgetShare> findByTripIdAndUserId(Long tripId, Long userId);
    
    List<BudgetShare> findByTripIdAndStatus(Long tripId, BudgetShare.ShareStatus status);
    
    @Query("SELECT SUM(b.amount) FROM BudgetShare b WHERE b.trip.id = :tripId AND b.status = 'PAID'")
    java.math.BigDecimal sumPaidAmountByTripId(@Param("tripId") Long tripId);
    
    @Query("SELECT SUM(b.amount) FROM BudgetShare b WHERE b.trip.id = :tripId")
    java.math.BigDecimal sumTotalAmountByTripId(@Param("tripId") Long tripId);
    
    @Query("SELECT b FROM BudgetShare b WHERE b.trip.id = :tripId AND b.travelGroup.id = :groupId")
    List<BudgetShare> findByTripIdAndGroupId(@Param("tripId") Long tripId, @Param("groupId") Long groupId);
    
    void deleteByTripId(Long tripId);
}
