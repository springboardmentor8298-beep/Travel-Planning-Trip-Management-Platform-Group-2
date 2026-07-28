package com.tripnest.repository;
import com.tripnest.entity.TravelGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TravelGroupRepository extends JpaRepository<TravelGroup, Long> { List<TravelGroup> findByOwnerEmailOrMembersUserEmailOrderByCreatedAtDesc(String ownerEmail, String memberEmail); }
