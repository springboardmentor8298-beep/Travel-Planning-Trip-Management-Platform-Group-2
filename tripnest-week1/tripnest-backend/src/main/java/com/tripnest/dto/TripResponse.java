package com.tripnest.dto;

import com.tripnest.entity.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class TripResponse {
    private Long id;
    private String title;
    private DestinationResponse destination; // null if no destination linked
    private LocalDate startDate;
    private LocalDate endDate;
    private Double budget;
    private TripStatus status;
    private String ownerEmail;
    private int travelerCount;
}
