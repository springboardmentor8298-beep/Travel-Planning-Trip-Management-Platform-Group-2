package com.tripnest.dto;

import com.tripnest.entity.Destination;

public class RecommendationDTO {
    private Destination destination;
    private Double matchScore;
    private String reason;

    public RecommendationDTO() {
    }

    public RecommendationDTO(Destination destination, Double matchScore, String reason) {
        this.destination = destination;
        this.matchScore = matchScore;
        this.reason = reason;
    }

    public Destination getDestination() {
        return destination;
    }

    public void setDestination(Destination destination) {
        this.destination = destination;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
