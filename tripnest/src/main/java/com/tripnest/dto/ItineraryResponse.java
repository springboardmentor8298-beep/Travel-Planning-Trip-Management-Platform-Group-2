package com.tripnest.dto;

import java.time.LocalDate;
import java.util.List;

public record ItineraryResponse(Long id, Integer dayNumber, LocalDate itineraryDate, String description,
                                List<ActivityResponse> activities) { }
