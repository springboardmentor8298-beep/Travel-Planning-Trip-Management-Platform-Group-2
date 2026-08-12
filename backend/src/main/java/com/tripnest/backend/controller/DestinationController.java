package com.tripnest.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.backend.model.DestinationEntity;
import com.tripnest.backend.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping({"/api/destinations", "/api/v1/destinations"})
@CrossOrigin(origins = "*")
public class DestinationController {

    @Autowired
    private DestinationRepository destinationRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<String, DestinationEntity> UNIQUE_DESTINATIONS = new LinkedHashMap<>();

    static {
        // --- INDIA TOP CURATED DESTINATIONS ---
        addUnique("gokarna", "Gokarna", "India", "Sacred Temple Town & Pristine Beach Haven", "28°C Pleasant", 4.9,
                "Om Beach, Kudle Beach, Mahabaleshwar Temple, Half Moon Beach, Paradise Beach",
                "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80",
                "Gokarna is a celebrated coastal town in Karnataka, India, famous for its ancient Mahabaleshwar temple, dramatic cliffside ocean views, and pristine palm-fringed beaches.");

        addUnique("ooty", "Ooty (Udhagamandalam)", "India", "Queen of Hill Stations in Nilgiri Hills", "18°C Cool", 4.85,
                "Doddabetta Peak, Ooty Lake, Government Botanical Garden, Nilgiri Mountain Railway",
                "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
                "Nestled in the Nilgiri Hills of Tamil Nadu, Ooty is famous for its rolling tea gardens, misty pine forests, and cool mountain climate.");

        addUnique("kodaikanal", "Kodaikanal", "India", "Princess of Hill Stations", "19°C Mist", 4.85,
                "Kodaikanal Lake, Coaker's Walk, Pillar Rocks, Bryant Park, Silver Cascade Falls",
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
                "Located in the Palani Hills of Tamil Nadu, Kodaikanal features serene star-shaped lakes, dense green forests, and breathtaking cliffside trails.");

        addUnique("goa", "Goa", "India", "Pearl of the Orient & Beach Paradise", "29°C Tropical", 4.9,
                "Baga Beach, Dudhsagar Falls, Fort Aguada, Anjuna Flea Market, Panjim Church",
                "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
                "India's coastal paradise famous for sun-kissed golden beaches, vibrant nightlife, water sports, and historic Portuguese architecture.");

        addUnique("kerala", "Kerala (Munnar & Alleppey)", "India", "God's Own Country", "27°C Pleasant", 4.95,
                "Alleppey Houseboats, Munnar Tea Gardens, Wayanad Wildlife Sanctuary, Varkala Cliff",
                "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
                "Serene backwater houseboats, lush emerald tea plantations, spice gardens, and tranquil palm-fringed coastlines.");

        addUnique("manali", "Manali", "India", "Valley of the Gods & Snow Peaks", "14°C Snowy", 4.88,
                "Solang Valley, Rohtang Pass, Hadimba Temple, Jogini Waterfall, Old Manali",
                "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
                "High-altitude Himalayan resort town in Himachal Pradesh known for snow adventures, paragliding, pine valleys, and riverside camping.");

        addUnique("coorg", "Coorg (Kodagu)", "India", "Scotland of India & Coffee Capital", "21°C Pleasant", 4.8,
                "Abbey Falls, Raja's Seat, Dubare Elephant Camp, Namdroling Monastery",
                "https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&w=800&q=80",
                "Picturesque hill station in Karnataka renowned for spice estates, aroma of fresh coffee plantations, and cascading waterfalls.");

        addUnique("jaipur", "Jaipur (Pink City)", "India", "Royal Forts & Palaces", "31°C Sunny", 4.85,
                "Hawa Mahal, Amber Fort, City Palace, Jal Mahal, Jantar Mantar",
                "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
                "Immerse yourself in royal Rajasthani heritage, magnificent pink sandstone forts, grand palaces, and colorful traditional bazaars.");

        addUnique("agra", "Taj Mahal & Agra", "India", "Land of Eternal Love & Mughal Wonders", "30°C Sunny", 4.95,
                "Taj Mahal, Agra Fort, Fatehpur Sikri, Mehtab Bagh",
                "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
                "Home to the iconic white marble Taj Mahal, one of the Seven Wonders of the World, and extraordinary UNESCO Mughal heritage.");

        addUnique("delhi", "New Delhi", "India", "Capital of India & Historic Mughal Heritage", "29°C Warm", 4.85,
                "Red Fort, Qutub Minar, India Gate, Lotus Temple, Humayun's Tomb",
                "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
                "The historic capital of India featuring grand Mughal monuments, vibrant spice bazaars, majestic colonial architecture, and world-class street food.");

        // --- INTERNATIONAL TOP CURATED DESTINATIONS ---
        addUnique("paris", "Paris", "France", "City of Lights & World Fashion", "22°C Sunny", 4.95,
                "Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, Arc de Triomphe, Seine Cruise",
                "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
                "Global center for art, fashion, gastronomy and culture along the romantic Seine River.");

        addUnique("tokyo", "Tokyo", "Japan", "Futuristic Metropolis & Ancient Traditions", "20°C Clear", 4.95,
                "Shibuya Crossing, Mount Fuji, Senso-ji Temple, Tokyo Skytree, Akihabara",
                "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
                "Ultramodern skyscrapers alongside historic temples, Michelin gastronomy, and neon entertainment districts.");

        addUnique("bali", "Bali", "Indonesia", "Tropical Island of Gods", "29°C Tropical", 4.9,
                "Ubud Rice Terraces, Uluwatu Temple, Tanha Lot, Seminyak Beach, Mount Batur",
                "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
                "Famed for volcanic mountains, iconic rice paddies, pristine surfing beaches, and spiritual coral reefs.");

        addUnique("newyork", "New York City", "United States (America)", "The City That Never Sleeps", "23°C Sunny", 4.9,
                "Statue of Liberty, Times Square, Central Park, Empire State Building, Brooklyn Bridge",
                "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
                "Iconic global epicenter for culture, Broadway theater, financial markets, world-class dining, and vibrant nightlife.");
    }

    private static void addUnique(String key, String name, String country, String tagline, String weather, double rating, String attractions, String image, String description) {
        UNIQUE_DESTINATIONS.put(key, new DestinationEntity(
                "dest_" + key, name, country, tagline, weather, rating, attractions, image, description, true
        ));
    }

    @PostConstruct
    public void initDatabase() {
        try {
            destinationRepository.saveAll(UNIQUE_DESTINATIONS.values());
        } catch (Exception e) {}
    }

    @GetMapping
    public ResponseEntity<List<DestinationEntity>> getAllDestinations(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            String query = search.trim().toLowerCase();

            String normalizedQuery = query;
            if (query.equals("america") || query.equals("usa") || query.equals("us")) {
                normalizedQuery = "united states";
            } else if (query.equals("uk") || query.equals("england") || query.equals("britain")) {
                normalizedQuery = "united kingdom";
            } else if (query.equals("uae") || query.equals("emirates")) {
                normalizedQuery = "dubai";
            }

            // 1. Database Search
            List<DestinationEntity> matches = destinationRepository.findByNameContainingIgnoreCaseOrCountryContainingIgnoreCase(query, normalizedQuery);
            if (!matches.isEmpty()) {
                Map<String, DestinationEntity> dedupMap = new LinkedHashMap<>();
                for (DestinationEntity d : matches) {
                    dedupMap.put(d.getName().toLowerCase(), d);
                }
                return ResponseEntity.ok(new ArrayList<>(dedupMap.values()));
            }

            // In-Memory Curated Catalog Check
            List<DestinationEntity> inMemoryMatches = new ArrayList<>();
            for (DestinationEntity d : UNIQUE_DESTINATIONS.values()) {
                if (d.getName().toLowerCase().contains(query) || d.getCountry().toLowerCase().contains(query) ||
                    d.getName().toLowerCase().contains(normalizedQuery) || d.getCountry().toLowerCase().contains(normalizedQuery)) {
                    inMemoryMatches.add(d);
                }
            }
            if (!inMemoryMatches.isEmpty()) {
                return ResponseEntity.ok(inMemoryMatches);
            }

            // 2. Real-Time Online Collaboration API Lookup (Wikipedia)
            DestinationEntity onlineDest = fetchWikipediaDestination(search.trim());
            if (onlineDest != null) {
                return ResponseEntity.ok(List.of(onlineDest));
            }
        }

        // When NO search query is typed (search is empty), ALWAYS return top curated destinations!
        return ResponseEntity.ok(new ArrayList<>(UNIQUE_DESTINATIONS.values()));
    }

    private DestinationEntity fetchWikipediaDestination(String query) {
        try {
            String wikiUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/" + URLEncoder.encode(query, StandardCharsets.UTF_8);
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TripNest/1.0 (contact@tripnest.com)");
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(wikiUrl, HttpMethod.GET, requestEntity, String.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                String title = json.has("title") ? json.get("title").asText() : query;
                String extract = json.has("extract") ? json.get("extract").asText() : "Explore historical marvels, local culture, and scenic beauty in " + title + ".";
                String tagline = json.has("description") ? json.get("description").asText() : "Discover " + title;

                String imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
                if (json.has("thumbnail") && json.get("thumbnail").has("source")) {
                    imageUrl = json.get("thumbnail").get("source").asText();
                } else if (json.has("originalimage") && json.get("originalimage").has("source")) {
                    imageUrl = json.get("originalimage").get("source").asText();
                }

                return new DestinationEntity(
                        "dest_online_" + UUID.randomUUID().toString().substring(0, 8),
                        title,
                        "Worldwide",
                        tagline,
                        "26°C Pleasant",
                        4.8,
                        title + " City Center, Historic Landmarks, Local Markets",
                        imageUrl,
                        extract,
                        true
                );
            }
        } catch (Exception e) {}
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDestinationById(@PathVariable String id) {
        return destinationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
