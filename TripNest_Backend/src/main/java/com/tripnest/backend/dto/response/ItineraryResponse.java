package com.tripnest.backend.dto.response;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ItineraryResponse {

    private Long id;

    private Integer dayNumber;

    private LocalDate date;

    private String notes;
    
    private List<ActivityResponse> activities;
}