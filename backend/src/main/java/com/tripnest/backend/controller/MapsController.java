package com.tripnest.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/maps")
@CrossOrigin(origins = "*")
public class MapsController {

    @Value("${app.google.maps.api-key:YOUR_GOOGLE_MAPS_KEY}")
    private String mapsApiKey;

    @GetMapping("/embed-url")
    public ResponseEntity<?> getEmbedUrl(@RequestParam("query") String query) {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String embedUrl = "https://www.google.com/maps/embed/v1/place?key=" + mapsApiKey + "&q=" + encodedQuery;
        
        // Public search fallback iframe URL
        String openMapsUrl = "https://maps.google.com/maps?q=" + encodedQuery + "&t=&z=13&ie=UTF8&iwloc=&output=embed";

        return ResponseEntity.ok(Map.of(
                "query", query,
                "googleEmbedUrl", embedUrl,
                "openMapsEmbedUrl", openMapsUrl,
                "apiKeyConfigured", !"YOUR_GOOGLE_MAPS_KEY".equals(mapsApiKey)
        ));
    }
}
