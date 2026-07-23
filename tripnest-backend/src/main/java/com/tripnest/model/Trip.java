package com.tripnest.model;

import jakarta.persistence.*;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String fromLocation;

    private String destination;

    private String startDate;

    private String endDate;

    private int travellers;

    private double budget;

    // Relationship with User
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Trip() {
    }

    public Trip(int id, String fromLocation, String destination,
                String startDate, String endDate,
                int travellers, double budget, User user) {

        this.id = id;
        this.fromLocation = fromLocation;
        this.destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.travellers = travellers;
        this.budget = budget;
        this.user = user;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFromLocation() {
        return fromLocation;
    }

    public void setFromLocation(String fromLocation) {
        this.fromLocation = fromLocation;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public int getTravellers() {
        return travellers;
    }

    public void setTravellers(int travellers) {
        this.travellers = travellers;
    }

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}