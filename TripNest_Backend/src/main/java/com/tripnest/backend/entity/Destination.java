package com.tripnest.backend.entity;

import com.tripnest.backend.common.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "destinations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Destination extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,length = 100)
    private String name;

    @Column(nullable = false,length = 100)
    private String city;

    @Column(nullable = false,length = 100)
    private String state;

    @Column(nullable = false,length = 100)
    private String country;

    @Column(length = 1000)
    private String description;

    private String imageUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

}