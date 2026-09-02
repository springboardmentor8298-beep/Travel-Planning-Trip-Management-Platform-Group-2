package com.tripnest.service;

import com.tripnest.dto.RecommendationDTO;

import java.util.List;

public interface RecommendationService {
    List<RecommendationDTO> getRecommendationsForUser(String userEmail);
}
