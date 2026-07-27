package com.tripnest.config;

import com.tripnest.entity.Destination;
import com.tripnest.entity.Role;
import com.tripnest.entity.enums.RoleName;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Ensures the three platform roles exist on startup so registration
 * and OAuth2 sign-in can always attach a default ROLE_TRAVELER. Also seeds a
 * handful of starter destinations so trip creation has something to pick from
 * on a fresh environment.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final DestinationRepository destinationRepository;

    @Override
    public void run(String... args) {
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName).orElseGet(() -> {
                Role role = new Role();
                role.setName(roleName);
                return roleRepository.save(role);
            });
        }

        seedDestinations();
    }

    private void seedDestinations() {
        if (destinationRepository.count() > 0) {
            return;
        }

        List<Destination> starterDestinations = List.of(
                destination("Kyoto", "Japan", "Kyoto",
                        "Historic temples, bamboo groves, and geisha districts.",
                        35.0116, 135.7681, 4.8),
                destination("Paris", "France", "Paris",
                        "The City of Light — museums, cafes, and the Eiffel Tower.",
                        48.8566, 2.3522, 4.6),
                destination("Bali", "Indonesia", "Denpasar",
                        "Tropical beaches, rice terraces, and vibrant temples.",
                        -8.3405, 115.0920, 4.7),
                destination("Cape Town", "South Africa", "Cape Town",
                        "Table Mountain, coastal drives, and world-class wineries.",
                        -33.9249, 18.4241, 4.7),
                destination("Reykjavik", "Iceland", "Reykjavik",
                        "Northern lights, geothermal springs, and dramatic landscapes.",
                        64.1466, -21.9426, 4.6),
                destination("New York City", "United States", "New York",
                        "Iconic skyline, Broadway shows, and endless neighborhoods to explore.",
                        40.7128, -74.0060, 4.5)
        );

        destinationRepository.saveAll(starterDestinations);
    }

    private Destination destination(String name, String country, String city, String description,
                                     double latitude, double longitude, double averageRating) {
        Destination destination = new Destination();
        destination.setName(name);
        destination.setCountry(country);
        destination.setCity(city);
        destination.setDescription(description);
        destination.setLatitude(latitude);
        destination.setLongitude(longitude);
        destination.setAverageRating(averageRating);
        return destination;
    }
}
