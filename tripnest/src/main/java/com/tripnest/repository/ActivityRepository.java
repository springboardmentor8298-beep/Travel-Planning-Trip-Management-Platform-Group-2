package com.tripnest.repository;

import com.tripnest.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tripnest.entity.Activity;
import java.time.LocalDateTime;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByReminderAtBeforeAndReminderSentAtIsNull(LocalDateTime now);
}
