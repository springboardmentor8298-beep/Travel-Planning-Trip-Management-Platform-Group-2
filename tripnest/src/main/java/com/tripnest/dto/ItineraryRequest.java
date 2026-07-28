package com.tripnest.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ItineraryRequest(@NotNull Integer dayNumber, @NotNull LocalDate itineraryDate, String description) { }
