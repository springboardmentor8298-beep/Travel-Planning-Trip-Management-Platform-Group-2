package com.tripnest.service.impl;

import com.tripnest.dto.RecommendationDTO;
import com.tripnest.entity.Destination;
import com.tripnest.entity.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.service.RecommendationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;

    public RecommendationServiceImpl(DestinationRepository destinationRepository, UserRepository userRepository) {
        this.destinationRepository = destinationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<RecommendationDTO> getRecommendationsForUser(String userEmail) {
        User user = userEmail != null ? userRepository.findByEmail(userEmail).orElse(null) : null;
        List<Destination> destinations = destinationRepository.findAll();

        String prefs = user != null && user.getTravelPreferences() != null ? user.getTravelPreferences().toLowerCase() : "";
        String favDest = user != null && user.getFavoriteDestination() != null ? user.getFavoriteDestination().toLowerCase() : "";

        List<RecommendationDTO> result = new ArrayList<>();

        for (Destination d : destinations) {
            double score = 0.0;
            List<String> matchReasons = new ArrayList<>();

            // Rating score (0 to 5)
            if (d.getRating() != null) {
                score += d.getRating().doubleValue() * 10;
            }

            // Category match
            if (d.getCategory() != null && !prefs.isEmpty() && prefs.contains(d.getCategory().toLowerCase())) {
                score += 35;
                matchReasons.add("matches your interest in " + d.getCategory());
            }

            // State/Region match
            if (d.getState() != null && !prefs.isEmpty() && prefs.contains(d.getState().toLowerCase())) {
                score += 25;
                matchReasons.add("is located in your preferred region (" + d.getState() + ")");
            }

            // Favorite destination match
            if (d.getDestinationName() != null && !favDest.isEmpty() && d.getDestinationName().toLowerCase().contains(favDest)) {
                score += 30;
                matchReasons.add("matches your favorite destination preferences");
            }

            // Budget match
            if (d.getBudgetCategory() != null && !prefs.isEmpty() && prefs.contains(d.getBudgetCategory().toLowerCase())) {
                score += 20;
                matchReasons.add("fits your preferred budget tier (" + d.getBudgetCategory() + ")");
            }

            String reason = matchReasons.isEmpty()
                    ? "Popular destination rated " + (d.getRating() != null ? d.getRating() : "4.8") + " stars by travel community."
                    : "Recommended because it " + String.join(" and ", matchReasons) + ".";

            result.add(new RecommendationDTO(d, score, reason));
        }

        result.sort(Comparator.comparing(RecommendationDTO::getMatchScore).reversed());
        return result.stream().limit(8).collect(Collectors.toList());
    }
}
