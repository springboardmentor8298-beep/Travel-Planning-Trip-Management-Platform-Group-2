package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DestinationResponse {
    private Long id;
    private String name;
    private String country;
    private String description;
    private String imageUrl;
    private String popularAttractions;
}
