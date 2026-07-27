package com.tripnest.dto.destination;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DestinationRequest {

    @NotBlank(message = "Destination name is required")
    @Size(max = 150)
    private String name;

    @Size(max = 100)
    private String country;

    @Size(max = 100)
    private String city;

    private String description;

    private Double latitude;
    private Double longitude;

    private String coverImageUrl;
}
