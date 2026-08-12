package com.tripnest.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping({"/api/ai", "/api/v1/ai"})
@CrossOrigin(origins = "*")
public class AIChatController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithAI(@RequestBody Map<String, Object> payload) {
        String message = payload.getOrDefault("message", "").toString().trim();
        List<Map<String, String>> history = (List<Map<String, String>>) payload.getOrDefault("history", Collections.emptyList());
        
        String reply = generateDeepConversationalReply(message, history);
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    private String generateDeepConversationalReply(String input, List<Map<String, String>> history) {
        if (input.isEmpty()) {
            return "👋 Hello! Where would you like to travel next? Ask me about any destination worldwide!";
        }

        String lowerInput = input.toLowerCase().trim();

        // 1. Identify active location from current message OR conversation history
        String activeLocation = extractLocationFromMessage(input);
        
        if (activeLocation == null) {
            for (int i = history.size() - 1; i >= 0; i--) {
                Map<String, String> entry = history.get(i);
                String text = entry.getOrDefault("text", "");
                String loc = extractLocationFromMessage(text);
                if (loc != null) {
                    activeLocation = loc;
                    break;
                }
            }
        }

        // 2. Check if user is asking to proceed ("okay", "next", "proceed", "tell me more", "more", "yes", "sure")
        boolean isFollowUp = lowerInput.equals("okay") || lowerInput.equals("ok") || lowerInput.equals("next") || 
                             lowerInput.equals("proceed") || lowerInput.contains("tell me more") || lowerInput.equals("more") || 
                             lowerInput.equals("yes") || lowerInput.equals("sure") || lowerInput.contains("deep") || lowerInput.contains("detail");

        if (isFollowUp && activeLocation != null) {
            int turnCount = countLocationTurns(history, activeLocation);
            
            if (turnCount >= 2) {
                return generateLevel3DeepStaysAndFood(activeLocation);
            } else {
                return generateLevel2DeepItinerary(activeLocation);
            }
        }

        if (activeLocation != null && !isFollowUp) {
            RealTimeWikiData wikiData = fetchRealTimeWikiData(activeLocation);
            if (wikiData != null) {
                return generateLevel1Overview(wikiData);
            }
        }

        if (isFollowUp) {
            return "💡 Which destination would you like to explore deeper? Type any place name (e.g. Gokarna, Malaysia, Tokyo, Paris, Kerala, Ooty)!";
        }

        RealTimeWikiData wikiData = fetchRealTimeWikiData(input);
        if (wikiData == null) {
            return "❌ Destination Not Found:\n\n" +
                    "'" + input + "' does not appear to be a recognized real-world destination or city.\n\n" +
                    "💡 Please verify the spelling or search for popular places like Gokarna, Malaysia, Tokyo, Paris, Kerala, or Ooty!";
        }

        return generateLevel1Overview(wikiData);
    }

    private String generateLevel1Overview(RealTimeWikiData wikiData) {
        StringBuilder sb = new StringBuilder();
        sb.append("✨ Real-Time Travel Overview for ").append(wikiData.title).append(":\n\n");
        sb.append("📍 Overview & Highlights:\n");
        sb.append(wikiData.extract).append("\n\n");
        if (wikiData.description != null && !wikiData.description.isBlank()) {
            sb.append("🏷️ Category: ").append(wikiData.description).append("\n\n");
        }
        sb.append("🗓️ Essential Info:\n");
        sb.append("• Recommended Duration: 3 to 5 Days\n");
        sb.append("• Best Travel Season: October to March\n");
        sb.append("• Estimated Budget: ~₹12,000 - ₹20,000 per person\n\n");
        sb.append("👉 Reply 'okay' or 'proceed' to see the detailed Day-by-Day Itinerary!");
        return sb.toString();
    }

    private String generateLevel2DeepItinerary(String location) {
        String place = capitalize(location);
        return "🗺️ Deep 3-Day Custom Itinerary for " + place + " (Level 2 Detail):\n\n" +
                "📍 DAY 1: Arrival & Core Attractions\n" +
                "• Morning: Check-in, refresh, and visit the iconic main landmark of " + place + ".\n" +
                "• Afternoon: Traditional regional lunch followed by a guided historic/cultural walking tour.\n" +
                "• Evening: Sunset viewpoint walk, local handicrafts shopping & night market dining.\n\n" +
                "🌿 DAY 2: Offbeat Trails & Scenic Exploration\n" +
                "• Morning: Early morning nature trail / beach trek or scenic cable car/toy train ride.\n" +
                "• Afternoon: Picnic lunch at scenic lake/waterfall spot & photography session.\n" +
                "• Evening: Cafe hopping & live music evening.\n\n" +
                "🌅 DAY 3: Local Hidden Gems & Farewell\n" +
                "• Morning: Souvenir shopping & visiting local heritage artisanal workshops.\n" +
                "• Afternoon: Farewell regional feast & departure transit.\n\n" +
                "👉 Reply 'proceed' or 'stays' for hotel recommendations, budget breakdown, and secret cafes!";
    }

    private String generateLevel3DeepStaysAndFood(String location) {
        String place = capitalize(location);
        return "🏨 Deep Stay, Dining & Budget Breakdown for " + place + " (Level 3 Detail):\n\n" +
                "🏡 Recommended Stays & Price Ranges:\n" +
                "• Cliffside / Scenic View Resorts: ~₹4,500 - ₹8,000/night (Panoramic balcony views & spa)\n" +
                "• Boutique Heritage Homestays: ~₹2,500 - ₹4,000/night (Authentic local hospitality)\n" +
                "• Backpacker Hostels: ~₹800 - ₹1,400/bed (Social vibe & communal kitchen)\n\n" +
                "🍽️ Must-Try Local Cuisine & Famous Cafes:\n" +
                "• Specialty Dishes: Fresh regional delicacies, spiced curries, fresh fruit smoothie bowls & bakery breakfast.\n" +
                "• Popular Dining Spots: Beachfront shacks, heritage courtyard thalis, and rooftop sunset cafes.\n\n" +
                "💰 Complete Expense Allocation:\n" +
                "• Accommodation: 40% | Food & Dining: 30% | Transit & Sightseeing: 30%\n\n" +
                "💡 Pro Tip: Book stays at least 2-3 weeks in advance for peak seasonal discounts!";
    }

    private String extractLocationFromMessage(String text) {
        if (text == null || text.isBlank()) return null;
        String lower = text.toLowerCase();
        
        String[] known = {"gokarna", "ooty", "kodaikanal", "goa", "kerala", "manali", "coorg", "jaipur", "agra", "delhi", "paris", "tokyo", "bali", "singapore", "thailand", "malaysia", "switzerland", "maldives", "dubai", "london", "new york", "america", "rome", "reykjavik", "cairo", "sydney"};
        for (String k : known) {
            if (lower.contains(k)) {
                return k;
            }
        }
        
        String trimmed = text.trim();
        if (trimmed.length() > 2 && !trimmed.contains(" ") && 
            !lower.equals("okay") && !lower.equals("ok") && !lower.equals("next") && 
            !lower.equals("proceed") && !lower.equals("more") && !lower.equals("yes") && !lower.equals("sure")) {
            return trimmed;
        }
        return null;
    }

    private int countLocationTurns(List<Map<String, String>> history, String location) {
        int count = 0;
        String lowerLoc = location.toLowerCase();
        for (Map<String, String> entry : history) {
            String text = entry.getOrDefault("text", "").toLowerCase();
            if (text.contains(lowerLoc) || text.contains("level 2") || text.contains("itinerary")) {
                count++;
            }
        }
        return count;
    }

    private RealTimeWikiData fetchRealTimeWikiData(String query) {
        try {
            String wikiUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/" + URLEncoder.encode(query, StandardCharsets.UTF_8);
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TripNest/1.0 (contact@tripnest.com)");
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(wikiUrl, HttpMethod.GET, requestEntity, String.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());

                if (json.has("type") && json.get("type").asText().equalsIgnoreCase("disambiguation")) {
                    return null;
                }

                String title = json.has("title") ? json.get("title").asText() : query;
                String extract = json.has("extract") ? json.get("extract").asText() : "";
                String description = json.has("description") ? json.get("description").asText() : "";

                if (extract.isBlank()) {
                    return null;
                }

                return new RealTimeWikiData(title, extract, description);
            }
        } catch (Exception e) {}
        return null;
    }

    private static class RealTimeWikiData {
        String title;
        String extract;
        String description;

        RealTimeWikiData(String title, String extract, String description) {
            this.title = title;
            this.extract = extract;
            this.description = description;
        }
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return "your destination";
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
