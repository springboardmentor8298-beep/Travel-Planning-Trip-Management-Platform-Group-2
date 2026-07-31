package com.tripnest.backend.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class GeminiClient {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${http.client.connect-timeout}")
    private int connectTimeout;

    @Value("${http.client.read-timeout}")
    private int readTimeout;

    private RestClient restClient;
    private final ObjectMapper objectMapper;

    @PostConstruct
    public void init() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeout);
        requestFactory.setReadTimeout(readTimeout);

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl(apiUrl)
                .build();
    }

    public List<GeminiDestination> getDestinations(String country, String state) {
        log.info("Calling Gemini API for Country: {}, State: {} using model: {}...", country, state, model);

        String prompt = String.format(
                "You are a travel assistant. Generate a list of exactly 10 famous tourist destinations in the state of %s, %s.\n" +
                "Return ONLY a valid JSON array of objects. Do NOT include any markdown formatting (like ```json), explanations, or text outside the JSON array.\n" +
                "The JSON array must have exactly the following structure:\n" +
                "[\n" +
                "  {\n" +
                "    \"name\": \"Destination Name\",\n" +
                "    \"famousFor\": \"Short description of why it is famous\"\n" +
                "  }\n" +
                "]",
                state, country
        );

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        int maxRetries = 2;
        int attempt = 0;
        Exception lastException = null;

        while (attempt <= maxRetries) {
            long startTime = System.currentTimeMillis();
            attempt++;
            log.info("Gemini API attempt {}/{}...", attempt, maxRetries + 1);

            try {
                ResponseEntity<String> responseEntity = restClient.post()
                        .uri(uriBuilder -> uriBuilder
                                .path("/" + model + ":generateContent")
                                .queryParam("key", apiKey)
                                .build())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(requestBody)
                        .retrieve()
                        .toEntity(String.class);

                long duration = System.currentTimeMillis() - startTime;
                log.info("Gemini API call took {} ms. Status: {}, Content-Type: {}, Headers: {}", 
                         duration, responseEntity.getStatusCode(), responseEntity.getHeaders().getContentType(), responseEntity.getHeaders());

                if (!responseEntity.getStatusCode().is2xxSuccessful()) {
                    log.warn("Gemini API returned non-2xx status code: {}", responseEntity.getStatusCode());
                    throw new RuntimeException("HTTP Status " + responseEntity.getStatusCode());
                }

                String responseJson = responseEntity.getBody();
                if (responseJson == null || responseJson.isBlank()) {
                    log.warn("Gemini API returned empty response body.");
                    throw new RuntimeException("Empty response body");
                }

                log.debug("Gemini response body: {}", responseJson);

                // Verify content type is JSON before parsing
                MediaType contentType = responseEntity.getHeaders().getContentType();
                if (contentType != null && !contentType.isCompatibleWith(MediaType.APPLICATION_JSON)) {
                    log.warn("Gemini API returned unexpected Content-Type: {}. Response Body preview: {}", 
                             contentType, responseJson.substring(0, Math.min(200, responseJson.length())));
                    throw new RuntimeException("Unexpected Content-Type: " + contentType);
                }

                JsonNode rootNode = objectMapper.readTree(responseJson);
                String rawText = rootNode.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();

                if (rawText == null || rawText.isBlank()) {
                    log.warn("Gemini response text is blank. Full response: {}", responseJson);
                    throw new RuntimeException("Blank response text");
                }

                String cleanedJson = rawText.trim();
                if (cleanedJson.startsWith("```")) {
                    cleanedJson = cleanedJson.replaceAll("^```[a-zA-Z]*", "");
                    cleanedJson = cleanedJson.replaceAll("```$", "");
                    cleanedJson = cleanedJson.trim();
                }

                List<GeminiDestination> destinations = objectMapper.readValue(
                        cleanedJson,
                        new TypeReference<List<GeminiDestination>>() {}
                );

                log.info("Gemini returned {} destinations successfully on attempt {}", destinations.size(), attempt);
                return destinations;

            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                lastException = e;
                log.error("Gemini API attempt {} failed after {} ms: {}", attempt, duration, e.getMessage());

                if (attempt > maxRetries) {
                    break;
                }

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        log.error("All {} attempts to call Gemini API failed due to: {}. Falling back to mock data.", maxRetries + 1, lastException.getMessage());
        return getMockDestinations(state);
    }

    private List<GeminiDestination> getMockDestinations(String state) {
        log.info("Generating fallback mock destinations for state: {}", state);
        List<GeminiDestination> list = new ArrayList<>();
        
        String normalizedState = state.trim().toLowerCase();
        
        if (normalizedState.contains("kerala")) {
            list.add(new GeminiDestination("Munnar", "Famous for its lush green tea plantations and scenic hill stations."));
            list.add(new GeminiDestination("Alleppey", "Renowned for its beautiful backwater houseboats and serene lakes."));
            list.add(new GeminiDestination("Kochi", "A historic port city known for Fort Kochi and Chinese fishing nets."));
            list.add(new GeminiDestination("Wayanad", "Famous for its waterfalls, caves, spice plantations, and wildlife."));
            list.add(new GeminiDestination("Varkala", "Known for its unique red cliffs adjacent to the Arabian Sea."));
            list.add(new GeminiDestination("Kovalam", "A popular beach town with iconic lighthouse and shallow waters."));
            list.add(new GeminiDestination("Thekkady", "Home to Periyar National Park, famous for elephants and spices."));
            list.add(new GeminiDestination("Kumarakom", "Renowned for backwater tourism and bird sanctuary."));
            list.add(new GeminiDestination("Athirappilly Waterfalls", "Known as the Niagara of India, a majestic cascade."));
            list.add(new GeminiDestination("Vagamon", "A quiet, scenic hill station with pine forests and green meadows."));
        } else if (normalizedState.contains("goa")) {
            list.add(new GeminiDestination("Calangute Beach", "Known as the Queen of Beaches, famous for water sports."));
            list.add(new GeminiDestination("Baga Beach", "Popular for nightlife, beach shacks, and vibrant parties."));
            list.add(new GeminiDestination("Basilica of Bom Jesus", "UNESCO world heritage site containing mortal remains of St. Francis Xavier."));
            list.add(new GeminiDestination("Dudhsagar Falls", "Four-tiered majestic waterfall appearing like a sea of milk."));
            list.add(new GeminiDestination("Fort Aguada", "A well-preserved 17th-century Portuguese fort and lighthouse."));
            list.add(new GeminiDestination("Anjuna Beach", "Famous for its flea market and trance music culture."));
            list.add(new GeminiDestination("Palolem Beach", "A scenic, semi-circle beach famous for silent discos."));
            list.add(new GeminiDestination("Panaji", "The capital city known for Portuguese-style houses and churches."));
            list.add(new GeminiDestination("Colva Beach", "One of the oldest and largest white sand beaches in South Goa."));
            list.add(new GeminiDestination("Mangueshi Temple", "A historic temple dedicated to Lord Shiva with unique architecture."));
        } else if (normalizedState.contains("delhi")) {
            list.add(new GeminiDestination("Red Fort", "Historic Mughal fort built of red sandstone in Old Delhi."));
            list.add(new GeminiDestination("Qutub Minar", "UNESCO world heritage site, a 73-meter tall brick minaret."));
            list.add(new GeminiDestination("India Gate", "War memorial dedicated to Indian soldiers of World War I."));
            list.add(new GeminiDestination("Lotus Temple", "A Bahai House of Worship famous for its flowerlike shape."));
            list.add(new GeminiDestination("Humayun's Tomb", "UNESCO world heritage site, precursor to the Taj Mahal."));
            list.add(new GeminiDestination("Akshardham Temple", "A massive modern Hindu temple complex showcasing Indian culture."));
            list.add(new GeminiDestination("Jama Masjid", "One of the largest mosques in India built by Shah Jahan."));
            list.add(new GeminiDestination("Chandni Chowk", "One of the oldest and busiest markets in Old Delhi."));
            list.add(new GeminiDestination("Rashtrapati Bhavan", "The official presidential residence with beautiful Mughal gardens."));
            list.add(new GeminiDestination("Connaught Place", "A primary commercial hub with Georgian-style architecture."));
        } else {
            String capitalizedState = state.substring(0, 1).toUpperCase() + (state.length() > 1 ? state.substring(1) : "");
            list.add(new GeminiDestination(capitalizedState + " Palace", "A majestic historic royal residence in " + capitalizedState + "."));
            list.add(new GeminiDestination(capitalizedState + " Fort", "A grand ancient fortress offering panoramic views."));
            list.add(new GeminiDestination(capitalizedState + " National Park", "A lush wildlife sanctuary sheltering rare species."));
            list.add(new GeminiDestination(capitalizedState + " Museum", "A rich repository of historical artifacts and local culture."));
            list.add(new GeminiDestination(capitalizedState + " Lake", "A scenic freshwater lake perfect for boating and sunsets."));
            list.add(new GeminiDestination(capitalizedState + " Hills", "A serene hill station retreat surrounded by mist and valleys."));
            list.add(new GeminiDestination(capitalizedState + " Falls", "A gorgeous natural waterfall cascade set in deep jungles."));
            list.add(new GeminiDestination(capitalizedState + " Valley", "A beautiful valley known for trekking and eco-tourism."));
            list.add(new GeminiDestination(capitalizedState + " Temple", "A highly revered spiritual site with exquisite carvings."));
            list.add(new GeminiDestination(capitalizedState + " Sanctuary", "A protected reserve famous for bird watching and safari."));
        }
        
        return list;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeminiDestination {
        private String name;
        private String famousFor;
    }
}
