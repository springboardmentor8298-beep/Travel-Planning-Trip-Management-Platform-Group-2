package com.tripnest.backend.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.NotificationResponse;
import com.tripnest.backend.entity.Notification;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.enums.NotificationType;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.NotificationRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<NotificationResponse>> getNotifications() {
        User user = getCurrentUser();
        List<NotificationResponse> list = notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<NotificationResponse>>builder()
                .success(true)
                .message("Notifications retrieved successfully")
                .data(list)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<NotificationResponse>> getUnreadNotifications() {
        User user = getCurrentUser();
        List<NotificationResponse> list = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ApiResponse.<List<NotificationResponse>>builder()
                .success(true)
                .message("Unread notifications retrieved successfully")
                .data(list)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<NotificationResponse> markAsRead(Long notificationId) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);

        return ApiResponse.<NotificationResponse>builder()
                .success(true)
                .message("Notification marked as read")
                .data(mapToResponse(notification))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<String> markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unread = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);

        return ApiResponse.<String>builder()
                .success(true)
                .message("All notifications marked as read")
                .data("All notifications marked as read")
                .build();
    }

    @Override
    @Transactional
    public void createNotification(User user, String title, String message, NotificationType type, Long referenceId, String referenceType) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}
