package com.tripnest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TripResponse {

    private Integer tripId;
    private String tripName;
    private Integer destinationId;
    private String destinationName;
    private String city;
    private String state;
    private String country;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfTravelers;
    private BigDecimal budgetAllocated;
    private String status;
    private String description;
    private String coverImage;
    private Integer durationDays;
    private Integer completedActivitiesCount;
    private Integer totalActivitiesCount;
    private Integer progressPercentage;

    // Constructors
    public TripResponse() {
    }

    // Getters and Setters

    public Integer getTripId() {
        return tripId;
    }

    public void setTripId(Integer tripId) {
        this.tripId = tripId;
    }

    public String getTripName() {
        return tripName;
    }

    public void setTripName(String tripName) {
        this.tripName = tripName;
    }

    public Integer getDestinationId() {
        return destinationId;
    }

    public void setDestinationId(Integer destinationId) {
        this.destinationId = destinationId;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
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

    public Integer getNumberOfTravelers() {
        return numberOfTravelers;
    }

    public void setNumberOfTravelers(Integer numberOfTravelers) {
        this.numberOfTravelers = numberOfTravelers;
    }

    public BigDecimal getBudgetAllocated() {
        return budgetAllocated;
    }

    public void setBudgetAllocated(BigDecimal budgetAllocated) {
        this.budgetAllocated = budgetAllocated;
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

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public Integer getCompletedActivitiesCount() {
        return completedActivitiesCount;
    }

    public void setCompletedActivitiesCount(Integer completedActivitiesCount) {
        this.completedActivitiesCount = completedActivitiesCount;
    }

    public Integer getTotalActivitiesCount() {
        return totalActivitiesCount;
    }

    public void setTotalActivitiesCount(Integer totalActivitiesCount) {
        this.totalActivitiesCount = totalActivitiesCount;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}
