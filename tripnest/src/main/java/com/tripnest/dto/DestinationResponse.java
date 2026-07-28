package com.tripnest.dto;

public record DestinationResponse(Long id, String name, String country, String state, String city,
                                  String description, String imageUrl, String travelGuide, String attractions,
                                  Integer popularityScore, Double latitude, Double longitude, String mapUrl,
                                  WeatherPlaceholder weather) {
    public record WeatherPlaceholder(String summary, String temperatureRange, String provider) { }
}
