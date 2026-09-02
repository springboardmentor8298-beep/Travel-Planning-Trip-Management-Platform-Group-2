package com.tripnest.repository;

import com.tripnest.entity.TripMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripMediaRepository extends JpaRepository<TripMedia, Integer> {
    List<TripMedia> findByTrip_TripId(Integer tripId);
    List<TripMedia> findByTrip_TripIdAndMediaCategory(Integer tripId, String mediaCategory);
}
