package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetShareResponse {
    
    private Long id;
    private Long tripId;
    private String tripTitle;
    private Long userId;
    private String username;
    private String userFirstName;
    private String userLastName;
    private Long groupId;
    private String groupName;
    private BigDecimal amount;
    private String shareType;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
