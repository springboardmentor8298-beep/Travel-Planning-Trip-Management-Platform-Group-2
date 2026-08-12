package com.tripnest.backend.repository;

import com.tripnest.backend.model.DiscussionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionRepository extends JpaRepository<DiscussionEntity, String> {
    List<DiscussionEntity> findByTripIdOrderByCreatedAtAsc(String tripId);
    void deleteByTripId(String tripId);
}
