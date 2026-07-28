package com.tripnest.dto;

import java.math.BigDecimal;

public class BudgetRequest {
    private Long tripId;
    private BigDecimal totalAmount;
    private BigDecimal accommodation;
    private BigDecimal transportation;
    private BigDecimal food;
    private BigDecimal activities;
    private BigDecimal other;
    private String currency;

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
