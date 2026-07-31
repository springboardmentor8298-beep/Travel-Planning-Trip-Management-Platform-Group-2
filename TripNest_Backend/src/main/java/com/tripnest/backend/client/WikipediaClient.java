package com.tripnest.backend.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class WikipediaClient {

    @Value("${http.client.connect-timeout}")
    private int connectTimeout;

    @Value("${http.client.read-timeout}")
    private int readTimeout;

    private RestClient restClient;
    
    // Thread-safe in-memory cache for Wikipedia summaries
    private final Map<String, WikipediaInfo> cache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeout);
        requestFactory.setReadTimeout(readTimeout);

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl("https://en.wikipedia.org/api/rest_v1")
                .defaultHeader("User-Agent", "TripNestTravelApp/1.0 (contact@tripnest.com; Internship Project)")
                .build();
    }

    /**
     * Sanitizes a destination name for Wikipedia API compatibility.
     * E.g., "Araku Valley (Hill Station)" -> "Araku_Valley"
     */
    public String sanitizeName(String name) {
        if (name == null) {
            return "";
        }
        // Remove parentheses and everything inside them
        String cleaned = name.split("\\(")[0].trim();
        // Replace spaces/whitespace sequences with underscores
        cleaned = cleaned.replaceAll("\\s+", "_");
        return cleaned;
    }

    /**
     * Fetches page summary from Wikipedia.
     * Handles failures gracefully returning null on error.
     */
    public WikipediaInfo fetchSummary(String destinationName) {
        String sanitized = sanitizeName(destinationName);
        if (sanitized.isBlank()) {
            return null;
        }

        // Cache lookup
        if (cache.containsKey(sanitized)) {
            log.info("Wikipedia cache hit for: {}", sanitized);
            return cache.get(sanitized);
        }

        log.info("Calling Wikipedia for {}...", sanitized);

        try {
            WikipediaInfo info = restClient.get()
                    .uri("/page/summary/{name}", sanitized)
                    .retrieve()
                    .body(WikipediaInfo.class);

            if (info != null) {
                log.info("Wikipedia success for {}", sanitized);
                cache.put(sanitized, info);
            } else {
                log.warn("Wikipedia returned empty response for {}", sanitized);
            }
            return info;

        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            log.warn("Wikipedia page not found (404) for: {}", sanitized);
            return null;
        } catch (Exception e) {
            log.error("Wikipedia failed for {}: {}", sanitized, e.getMessage());
            return null;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WikipediaInfo {
        private String title;
        private String description;
        private String extract;
        private ImageInfo thumbnail;
        private ImageInfo originalimage;
        private Coordinates coordinates;
        private ContentUrls content_urls;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class ImageInfo {
            private String source;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Coordinates {
            private Double lat;
            private Double lon;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class ContentUrls {
            private DesktopUrls desktop;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class DesktopUrls {
            private String page;
        }
    }
}
