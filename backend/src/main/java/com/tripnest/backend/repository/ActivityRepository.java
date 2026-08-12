package com.tripnest.backend.repository;

import com.tripnest.backend.model.ActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<ActivityEntity, String> {
    List<ActivityEntity> findByTripIdOrderByDayNumberAsc(String tripId);
    void deleteByTripId(String tripId);
}
