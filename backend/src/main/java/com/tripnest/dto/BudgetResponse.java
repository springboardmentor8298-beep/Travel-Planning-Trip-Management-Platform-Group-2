package com.tripnest.dto;

import java.math.BigDecimal;

public class BudgetResponse {
    private Long id;
    private Long tripId;
    private BigDecimal totalAmount;
    private BigDecimal accommodation;
    private BigDecimal transportation;
    private BigDecimal food;
    private BigDecimal activities;
    private BigDecimal other;
    private String currency;

    public BudgetResponse() {}

    public BudgetResponse(Long id, Long tripId, BigDecimal totalAmount, BigDecimal accommodation,
                         BigDecimal transportation, BigDecimal food, BigDecimal activities,
                         BigDecimal other, String currency) {
        this.id = id;
        this.tripId = tripId;
        this.totalAmount = totalAmount;
        this.accommodation = accommodation;
        this.transportation = transportation;
        this.food = food;
        this.activities = activities;
        this.other = other;
        this.currency = currency;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getAccommodation() { return accommodation; }
    public void setAccommodation(BigDecimal accommodation) { this.accommodation = accommodation; }

    public BigDecimal getTransportation() { return transportation; }
    public void setTransportation(BigDecimal transportation) { this.transportation = transportation; }

    public BigDecimal getFood() { return food; }
    public void setFood(BigDecimal food) { this.food = food; }

    public BigDecimal getActivities() { return activities; }
    public void setActivities(BigDecimal activities) { this.activities = activities; }

    public BigDecimal getOther() { return other; }
    public void setOther(BigDecimal other) { this.other = other; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
