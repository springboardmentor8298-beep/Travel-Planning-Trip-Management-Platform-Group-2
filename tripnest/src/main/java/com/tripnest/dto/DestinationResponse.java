package com.tripnest.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DestinationResponse {

    private Long id;
    private String name;
    private String description;
    private String location;
    private String city;
    private String country;
    private String imageUrl;
    private Double averageCost;
    private String bestTimeToVisit;
    private String climate;
    private Boolean popular;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}