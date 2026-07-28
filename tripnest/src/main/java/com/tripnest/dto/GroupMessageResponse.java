package com.tripnest.dto;
import java.time.LocalDateTime;
public record GroupMessageResponse(Long id, String message, String authorName, LocalDateTime createdAt) { }
