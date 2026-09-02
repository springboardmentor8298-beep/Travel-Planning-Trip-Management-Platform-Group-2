package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class ItineraryResponse {
    private Long id;
    private Long tripId;
    private Integer dayNumber;
    private LocalDate date;
    private String notes;
    private List<ActivityResponse> activities;
}
