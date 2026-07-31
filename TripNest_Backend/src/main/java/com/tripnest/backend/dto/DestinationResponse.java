package com.tripnest.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationResponse {
    private String name;
    private String famousFor;
    private String shortDescription; // Wikipedia description
    private String fullDescription;  // Wikipedia extract
    private String thumbnail;        // Wikipedia thumbnail image source URL
    private String image;            // Wikipedia original image source URL
    private Double latitude;         // Wikipedia coordinate latitude
    private Double longitude;        // Wikipedia coordinate longitude
    private String wikipediaUrl;     // Wikipedia page desktop URL
}
