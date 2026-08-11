package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDiscussionResponse {
    private Long id;
    private String title;
    private Long groupId;
    private Long createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;
}
