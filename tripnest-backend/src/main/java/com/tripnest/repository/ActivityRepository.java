package com.tripnest.repository;

import com.tripnest.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByItineraryIdOrderByScheduledTimeAsc(Long itineraryId);

    // Activities scheduled for a given date (via their parent Itinerary's
    // date) that haven't been reminded yet.
    @Query("SELECT a FROM Activity a WHERE a.itinerary.date = :date AND a.reminderSent = false")
    List<Activity> findByItineraryDateAndReminderSentFalse(@Param("date") LocalDate date);
}
