package com.tripnest.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class BookingEntity {

    @Id
    private String id;
    private String userId;
    private String tripId;
    private String itemType; // HOTEL, FLIGHT, ACTIVITY
    private String itemName;
    private String bookingReference;
    private Double price;
    private String status; // CONFIRMED, PENDING, CANCELLED
    private String bookingDate;
    private LocalDateTime createdAt;

    public BookingEntity() {}

    public BookingEntity(String id, String userId, String tripId, String itemType, String itemName, String bookingReference, Double price, String status, String bookingDate) {
        this.id = id;
        this.userId = userId;
        this.tripId = tripId;
        this.itemType = itemType;
        this.itemName = itemName;
        this.bookingReference = bookingReference;
        this.price = price;
        this.status = status;
        this.bookingDate = bookingDate;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
