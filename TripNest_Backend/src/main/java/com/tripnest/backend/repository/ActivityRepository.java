package com.tripnest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.Activity;
import com.tripnest.backend.entity.Itinerary;

public interface ActivityRepository extends JpaRepository<Activity, Long>{

    	List<Activity> findByItineraryOrderByActivityTimeAsc(Itinerary itinerary);
}
