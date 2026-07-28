package com.tripnest.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ActivityOrderRequest(@NotEmpty List<@NotNull Long> activityIds) { }
