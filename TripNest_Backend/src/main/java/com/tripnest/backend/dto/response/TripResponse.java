package com.tripnest.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.tripnest.backend.entity.enums.TripStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TripResponse {

    private Long id;

    private String tripName;

    private LocalDate startDate;

    private LocalDate endDate;

    private TripStatus status;

    private String destination;

    private String city;

    private String state;

    private String country;

    private Integer totalMembers;

    private String notes;
    
    private BigDecimal budget;

    private BigDecimal spent;

    private String description;
    
    private String coverImage;
}