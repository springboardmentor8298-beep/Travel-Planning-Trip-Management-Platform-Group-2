package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "destinations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(length = 2000)
    private String description;

    @Column(length = 500)
    private String imageUrl;

    // Simple comma-separated attractions for now; can normalize into its own
    // table in a later milestone if the discovery system grows.
    @Column(length = 1000)
    private String popularAttractions;
}
