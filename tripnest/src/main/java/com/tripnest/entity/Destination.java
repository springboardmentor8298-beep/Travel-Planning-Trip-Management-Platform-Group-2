package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "destinations")
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String country;

    private String state;

    private String city;

    @Column(length = 1000)
    private String description;

    private String imageUrl;

    @Column(length = 2000)
    private String travelGuide;
    @Column(length = 2000)
    private String attractions;
    private Integer popularityScore = 0;
    private Double latitude;
    private Double longitude;

    @OneToMany(mappedBy = "destinationDetails")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private java.util.List<Trip> trips;
}
