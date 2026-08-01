package com.tripnest.backend.repository;

import java.util.List;
import com.tripnest.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification,Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndIsReadOrderByCreatedAtDesc(User user, Boolean isRead);
}
