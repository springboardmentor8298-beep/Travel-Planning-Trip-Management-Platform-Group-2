package com.tripnest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "destinations")
@Getter
@Setter
@NoArgsConstructor
public class Destination extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double latitude;
    private Double longitude;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "average_rating")
    private Double averageRating;
}
