package com.tripnest.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GroupMessageResponse {
    private Long id;
    private Long tripId;
    private Long senderId;
    private String senderUsername;
    private String message;
    private LocalDateTime sentAt;
}
