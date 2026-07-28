package com.tripnest.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private Double budget;

    private String status;

    @Column(length = 1000)
    private String description;

    @OneToMany(
        mappedBy = "trip",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @JsonIgnore
    private List<Itinerary> itineraries;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Trip() {
    }

    // Generate Getters & Setters
    public Long getId() {
    return id;
}

public void setId(Long id) {
    this.id = id;
}

public String getTitle() {
    return title;
}

public void setTitle(String title) {
    this.title = title;
}

public String getDestination() {
    return destination;
}

public void setDestination(String destination) {
    this.destination = destination;
}

public LocalDate getStartDate() {
    return startDate;
}

public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
}

public LocalDate getEndDate() {
    return endDate;
}

public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
}

public Double getBudget() {
    return budget;
}

public void setBudget(Double budget) {
    this.budget = budget;
}

public String getStatus() {
    return status;
}

public void setStatus(String status) {
    this.status = status;
}

public String getDescription() {
    return description;
}

public void setDescription(String description) {
    this.description = description;
}

public User getUser() {
    return user;
}

public void setUser(User user) {
    this.user = user;
}


    public List<Itinerary> getItineraries() {
        return itineraries;
    }

    public void setItineraries(List<Itinerary> itineraries) {
        this.itineraries = itineraries;
    }
}