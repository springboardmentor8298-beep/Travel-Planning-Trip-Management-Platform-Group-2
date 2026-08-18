package com.tripnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DestinationRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @Size(max = 100)
    private String location;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String country;

    private Double averageCost;

    @Size(max = 100)
    private String bestTimeToVisit;

    @Size(max = 100)
    private String climate;

    private Boolean popular;

    private String imageUrl;
}