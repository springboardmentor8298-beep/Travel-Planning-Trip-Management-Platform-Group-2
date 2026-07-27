package com.tripnest.dto.itinerary;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ItineraryDayRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @Size(max = 150)
    private String title;

    private String notes;
}
