package com.tripnest.dto.destination;

import com.tripnest.entity.Destination;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class DestinationResponse {
    private Long id;
    private String name;
    private String country;
    private String city;
    private String description;
    private Double latitude;
    private Double longitude;
    private String coverImageUrl;
    private Double averageRating;
    private Instant createdAt;

    public static DestinationResponse fromEntity(Destination d) {
        return DestinationResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .country(d.getCountry())
                .city(d.getCity())
                .description(d.getDescription())
                .latitude(d.getLatitude())
                .longitude(d.getLongitude())
                .coverImageUrl(d.getCoverImageUrl())
                .averageRating(d.getAverageRating())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
