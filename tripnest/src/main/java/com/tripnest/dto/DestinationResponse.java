package com.tripnest.dto;

import lombok.Data;

/**
 * DTO returned when reading a Destination.
 */
@Data
public class DestinationResponse {

    private Long id;
    private String name;
    private String country;
    private String description;
    private String climate;
    private String bestTimeToVisit;
    private String popularAttractions;
    private String currentWeather;
    private String temperature;
    private String travelGuide;
    private String popularLocations;
    private String imageUrl;
}
