package com.tripnest.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "destinations")
public class DestinationEntity {

    @Id
    private String id;

    private String name;
    private String country;
    private String tagline;
    private String weatherInfo;
    private Double rating;

    @Column(columnDefinition = "TEXT")
    private String attractions;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Boolean isPopular = true;
    private LocalDateTime createdAt = LocalDateTime.now();

    public DestinationEntity() {}

    public DestinationEntity(String id, String name, String country, String tagline, String weatherInfo, Double rating, String attractions, String imageUrl, String description, Boolean isPopular) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.tagline = tagline;
        this.weatherInfo = weatherInfo;
        this.rating = rating;
        this.attractions = attractions;
        this.imageUrl = imageUrl;
        this.description = description;
        this.isPopular = isPopular != null ? isPopular : true;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getWeatherInfo() { return weatherInfo; }
    public void setWeatherInfo(String weatherInfo) { this.weatherInfo = weatherInfo; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getAttractions() { return attractions; }
    public void setAttractions(String attractions) { this.attractions = attractions; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsPopular() { return isPopular; }
    public void setIsPopular(Boolean isPopular) { this.isPopular = isPopular; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
