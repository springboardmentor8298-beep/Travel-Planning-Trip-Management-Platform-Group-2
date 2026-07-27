package com.tripnest.dto.trip;

import com.tripnest.entity.enums.TripStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TripStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TripStatus status;
}
