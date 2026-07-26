package com.tripnest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Destination entity — represents a tourist destination with travel information.
 * Seeded via data.sql with initial records.
 *
 * Schema:
 * CREATE TABLE destinations (
 *   id                   BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   name                 VARCHAR(150) NOT NULL,
 *   country              VARCHAR(100) NOT NULL,
 *   description          TEXT,
 *   climate              VARCHAR(100),
 *   best_time_to_visit   VARCHAR(150),
 *   popular_attractions  TEXT
 * );
 */
@Entity
@Table(name = "destinations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String country;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 100)
    @Column(length = 100)
    private String climate;

    @Size(max = 150)
    @Column(name = "best_time_to_visit", length = 150)
    private String bestTimeToVisit;

    @Column(name = "popular_attractions", columnDefinition = "TEXT")
    private String popularAttractions;

    @Column(length = 100)
    private String currentWeather;

    @Column(length = 100)
    private String temperature;

    @Column(name = "weather_updated_at")
    private java.time.LocalDateTime weatherUpdatedAt;

    @Column(columnDefinition = "TEXT")
    private String travelGuide;

    @Column(columnDefinition = "TEXT")
    private String popularLocations;

    @Column(length = 255)
    private String imageUrl;
}
