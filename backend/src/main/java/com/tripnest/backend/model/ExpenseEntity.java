package com.tripnest.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "expenses")
public class ExpenseEntity {

    @Id
    private String id;
    private String tripId;
    private String title;
    private Double amount;
    private String category;
    private String date;
    private String paidBy;
    private String notes;
    private String currency;

    public ExpenseEntity() {}

    public ExpenseEntity(String id, String tripId, String title, Double amount, String category, String date, String paidBy, String notes, String currency) {
        this.id = id;
        this.tripId = tripId;
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.date = date;
        this.paidBy = paidBy;
        this.notes = notes;
        this.currency = currency;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getPaidBy() { return paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
