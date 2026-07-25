package com.tripnest.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification,Long> {

}
