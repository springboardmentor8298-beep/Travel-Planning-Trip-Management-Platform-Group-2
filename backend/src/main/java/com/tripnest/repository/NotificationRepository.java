package com.tripnest.repository;

import com.tripnest.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    List<Notification> findByUser_EmailOrderByCreatedAtDesc(String email);
    long countByUser_UserIdAndIsReadFalse(Integer userId);
    long countByUser_EmailAndIsReadFalse(String email);
}