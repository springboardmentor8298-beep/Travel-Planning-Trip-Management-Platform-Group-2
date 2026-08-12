package com.tripnest.backend.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
public class TripEntity {

    @Id
    private String id;
    private String title;
    private String destination;
    private String startDate;
    private String endDate;
    private String ownerEmail;

    @Column(length = 2000)
    private String sharedMembers; // Comma-separated accepted member emails

    @JsonAlias({"budget", "total_budget"})
    private Double totalBudget;
    private Double spentBudget;
    private String coverImageUrl;
    private Integer memberCount;
    private Boolean isCompleted;
    private String status;
    
    @Column(length = 2000)
    private String notes;
    
    private LocalDateTime updatedAt;

    public TripEntity() {}

    public TripEntity(String id, String title, String destination, String startDate, String endDate, String ownerEmail, Double totalBudget, Double spentBudget, String coverImageUrl, Integer memberCount, Boolean isCompleted, String notes) {
        this.id = id;
        this.title = title;
        this.destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.ownerEmail = ownerEmail;
        this.totalBudget = totalBudget;
        this.spentBudget = spentBudget;
        this.coverImageUrl = coverImageUrl;
        this.memberCount = memberCount;
        this.isCompleted = isCompleted;
        this.status = (isCompleted != null && isCompleted) ? "COMPLETED" : "PLANNED";
        this.notes = notes;
        this.sharedMembers = "";
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    @PrePersist
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.status == null || this.status.isBlank()) {
            this.status = (this.isCompleted != null && this.isCompleted) ? "COMPLETED" : "PLANNED";
        }
        this.isCompleted = "COMPLETED".equalsIgnoreCase(this.status);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public String getSharedMembers() { return sharedMembers != null ? sharedMembers : ""; }
    public void setSharedMembers(String sharedMembers) { this.sharedMembers = sharedMembers; }

    public Double getTotalBudget() { return totalBudget != null ? totalBudget : 0.0; }
    public void setTotalBudget(Double totalBudget) { this.totalBudget = totalBudget; }

    public void setBudget(Double budget) {
        if (budget != null && (this.totalBudget == null || this.totalBudget == 0.0)) {
            this.totalBudget = budget;
        }
    }
    public Double getBudget() { return getTotalBudget(); }

    public Double getSpentBudget() { return spentBudget != null ? spentBudget : 0.0; }
    public void setSpentBudget(Double spentBudget) { this.spentBudget = spentBudget; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public Integer getMemberCount() { return memberCount != null ? memberCount : 1; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public Boolean getIsCompleted() { return isCompleted != null ? isCompleted : false; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public String getStatus() {
        if (status != null && !status.isBlank()) return status;
        return (isCompleted != null && isCompleted) ? "COMPLETED" : "PLANNED";
    }
    public void setStatus(String status) {
        this.status = status;
        if ("COMPLETED".equalsIgnoreCase(status)) {
            this.isCompleted = true;
        } else {
            this.isCompleted = false;
        }
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
