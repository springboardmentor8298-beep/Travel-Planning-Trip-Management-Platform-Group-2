package com.tripnest.backend.controller;

import com.tripnest.backend.model.DestinationEntity;
import com.tripnest.backend.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private DestinationRepository destinationRepository;

    @GetMapping("/destinations")
    public ResponseEntity<List<DestinationEntity>> getDestinationSuggestions(@RequestParam(required = false) String preference) {
        List<DestinationEntity> list = destinationRepository.findAll();
        if (list.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        Collections.shuffle(list);
        return ResponseEntity.ok(list.stream().limit(6).toList());
    }

    @GetMapping("/activities")
    public ResponseEntity<List<Map<String, Object>>> getActivitySuggestions(@RequestParam(required = false) String category) {
        List<Map<String, Object>> activities = List.of(
                Map.of("id", "act_rec_1", "title", "Cliffside Paragliding & Beach Trek", "category", "ADVENTURE", "place", "Gokarna", "estimatedCost", 2500, "rating", 4.9),
                Map.of("id", "act_rec_2", "title", "Sunrise Boat Cruise on Ganges", "category", "CULTURAL", "place", "Varanasi", "estimatedCost", 800, "rating", 4.95),
                Map.of("id", "act_rec_3", "title", "Heritage Tea Estate Walk", "category", "NATURE", "place", "Ooty", "estimatedCost", 1200, "rating", 4.8),
                Map.of("id", "act_rec_4", "title", "Scuba Diving & Coral Exploration", "category", "WATER_SPORTS", "place", "Goa", "estimatedCost", 3500, "rating", 4.85),
                Map.of("id", "act_rec_5", "title", "Backwater Houseboat Lunch Experience", "category", "LUXURY", "place", "Kerala", "estimatedCost", 4500, "rating", 4.92)
        );
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/smart-itinerary-ideas")
    public ResponseEntity<Map<String, Object>> getSmartItineraryIdeas(@RequestParam String destination) {
        Map<String, Object> idea = Map.of(
                "destination", destination,
                "recommendedDays", 4,
                "suggestedBudget", "₹15,000 - ₹25,000",
                "highlights", List.of("Day 1: Arrival & Local Market Walk", "Day 2: Top Attractions & Cultural Sites", "Day 3: Adventure & Nature Trail", "Day 4: Sunset Viewpoint & Departure"),
                "personalizedPick", "Best travel window: October to March"
        );
        return ResponseEntity.ok(idea);
    }
}
