package com.tripnest.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlements")
public class SettlementEntity {

    @Id
    private String id;
    private String tripId;
    private String payerName;
    private String payeeName;
    private Double amount;
    private String paymentMethod;
    private String notes;
    private LocalDateTime createdAt;

    public SettlementEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public SettlementEntity(String id, String tripId, String payerName, String payeeName, Double amount, String paymentMethod, String notes) {
        this.id = id;
        this.tripId = tripId;
        this.payerName = payerName;
        this.payeeName = payeeName;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public String getPayeeName() { return payeeName; }
    public void setPayeeName(String payeeName) { this.payeeName = payeeName; }

    public Double getAmount() { return amount != null ? amount : 0.0; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod != null ? paymentMethod : "Cash / UPI"; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
