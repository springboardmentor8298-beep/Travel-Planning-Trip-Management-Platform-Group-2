package com.tripnest;

import com.tripnest.entity.Destination;
import com.tripnest.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DataInitializer — seeds the destinations table after Spring context is fully
 * initialized (i.e., AFTER Hibernate has created/updated all tables via ddl-auto).
 *
 * Uses ApplicationRunner (runs AFTER CommandLineRunner in TripnestApplication).
 * The check for count() > 0 ensures idempotency — safe to run on every startup.
 * @Order(2) ensures it runs after TripnestApplication's role seeder (@Order(1) default).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class DataInitializer implements ApplicationRunner {

    private final DestinationRepository destinationRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (destinationRepository.count() > 0) {
            log.info("DataInitializer: destinations already seeded ({} found), skipping.",
                    destinationRepository.count());
            return;
        }

        log.info("DataInitializer: seeding 10 sample destinations...");

        destinationRepository.saveAll(List.of(
            dest("Paris", "France",
                "The City of Light, known for its art, fashion, gastronomy, and culture.",
                "Temperate oceanic", "April to June, September to November",
                "Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, Champs-Elysees"),

            dest("Bali", "Indonesia",
                "A magical island of temples, rice paddies, beaches, and vibrant culture.",
                "Tropical", "April to October",
                "Ubud Monkey Forest, Tanah Lot Temple, Seminyak Beach, Mount Batur"),

            dest("Tokyo", "Japan",
                "A fascinating blend of traditional temples and futuristic skyscrapers.",
                "Humid subtropical", "March to May, September to November",
                "Shibuya Crossing, Senso-ji Temple, Mount Fuji, Akihabara"),

            dest("New York City", "United States",
                "The Big Apple — a global hub of finance, fashion, art, and entertainment.",
                "Humid continental", "April to June, September to November",
                "Statue of Liberty, Central Park, Times Square, Metropolitan Museum of Art"),

            dest("Dubai", "United Arab Emirates",
                "A futuristic desert city known for luxury shopping, ultramodern architecture, and lively nightlife.",
                "Desert", "November to April",
                "Burj Khalifa, Dubai Mall, Palm Jumeirah, Desert Safari"),

            dest("Rome", "Italy",
                "The Eternal City, overflowing with ancient history, Renaissance art, and amazing cuisine.",
                "Mediterranean", "April to June, September to October",
                "Colosseum, Vatican City, Trevi Fountain, Roman Forum"),

            dest("Santorini", "Greece",
                "A breathtaking island famous for its white-washed buildings, blue-domed churches, and volcanic beaches.",
                "Mediterranean", "May to October",
                "Oia Village, Red Beach, Akrotiri Archaeological Site, Fira"),

            dest("Maldives", "Maldives",
                "An archipelago of 1,000 coral islands, famous for turquoise waters and overwater bungalows.",
                "Tropical", "November to April",
                "Male City, Biyadhoo Island, Banana Reef, Maafushi Island"),

            dest("Agra", "India",
                "Home to the iconic Taj Mahal, one of the Seven Wonders of the World.",
                "Semi-arid", "October to March",
                "Taj Mahal, Agra Fort, Fatehpur Sikri, Mehtab Bagh"),

            dest("Cape Town", "South Africa",
                "A stunning coastal city with dramatic mountains, diverse culture, and world-class cuisine.",
                "Mediterranean", "November to March",
                "Table Mountain, Cape of Good Hope, Robben Island, V&A Waterfront")
        ));

        log.info("DataInitializer: seeded {} destinations successfully.",
                destinationRepository.count());
    }

    private Destination dest(String name, String country, String description,
                              String climate, String bestTime, String attractions) {
        Destination d = new Destination();
        d.setName(name);
        d.setCountry(country);
        d.setDescription(description);
        d.setClimate(climate);
        d.setBestTimeToVisit(bestTime);
        d.setPopularAttractions(attractions);
        return d;
    }
}
