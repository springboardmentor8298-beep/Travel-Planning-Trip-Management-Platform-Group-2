package com.tripnest.backend.dto.admin;

import com.tripnest.backend.entity.enums.TripStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTripResponseDto {

    private Long id;
    private String tripName;
    private String ownerName;
    private String ownerEmail;
    private LocalDate startDate;
    private LocalDate endDate;
    private TripStatus status;
    private BigDecimal budget;
    private LocalDateTime createdAt;
    private Integer totalMembers;
}
