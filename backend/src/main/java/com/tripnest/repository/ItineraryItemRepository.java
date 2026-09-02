package com.tripnest.repository;

import com.tripnest.model.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    List<ItineraryItem> findByTripIdOrderByActivityDateAscStartTimeAsc(Long tripId);
}
