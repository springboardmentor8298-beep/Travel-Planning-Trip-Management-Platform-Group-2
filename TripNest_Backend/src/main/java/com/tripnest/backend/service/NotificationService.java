package com.tripnest.backend.service;

import java.util.List;
import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.NotificationResponse;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.enums.NotificationType;

public interface NotificationService {

    ApiResponse<List<NotificationResponse>> getNotifications();

    ApiResponse<List<NotificationResponse>> getUnreadNotifications();

    ApiResponse<NotificationResponse> markAsRead(Long notificationId);

    ApiResponse<String> markAllAsRead();

    void createNotification(User user, String title, String message, NotificationType type, Long referenceId, String referenceType);
}
