package com.tripnest.backend.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.tripnest.backend.common.BaseEntity;
import com.tripnest.backend.entity.enums.TripStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tripName;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripStatus status;
    
    @Column(length = 2000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(
    	    mappedBy = "trip",
    	    cascade = CascadeType.ALL,
    	    orphanRemoval = true
    	)
    @Builder.Default
    private List<Destination> destinations = new ArrayList<>();    
    @OneToMany(
            mappedBy = "trip",
            cascade = CascadeType.ALL,
            orphanRemoval = true         // Hibernate automatically deletes it from the database
    )
    @Builder.Default
    private List<Itinerary> itineraries = new ArrayList<>();
    @OneToOne(
            mappedBy = "trip",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Budget budget;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private Integer totalMembers;
    
    @Column(length = 500)
    private String coverImage;
}