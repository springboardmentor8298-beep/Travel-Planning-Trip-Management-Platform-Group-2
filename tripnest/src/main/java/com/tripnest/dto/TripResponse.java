package com.tripnest.dto;

import java.time.LocalDate;

public record TripResponse(Long id, String tripName, String destination, LocalDate startDate,
                           LocalDate endDate, Double budget, String status, Long destinationId) { }
