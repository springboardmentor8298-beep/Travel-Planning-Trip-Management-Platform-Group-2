package com.tripnest.dto;

import java.util.List;

public record TripPageResponse(List<TripResponse> content, int page, int size, long totalElements, int totalPages) { }
