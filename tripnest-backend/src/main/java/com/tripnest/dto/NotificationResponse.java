package com.tripnest.dto;

import com.tripnest.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String message;
    private Long relatedTripId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
