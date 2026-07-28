package com.tripnest.config;

import com.tripnest.entity.Destination;
import com.tripnest.entity.Role;
import com.tripnest.entity.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(DestinationRepository destinationRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.destinationRepository = destinationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();

        String img = "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?image_size=landscape_16_9&prompt=";
        try {
            List<Destination> desiredDestinations = Arrays.asList(
                    createDestination("Paris", "France", "Paris", "The City of Light, known for the Eiffel Tower, Louvre Museum, and charming cafes.",
                            img + java.net.URLEncoder.encode("Iconic Eiffel Tower Paris sunset golden hour, Seine River, charming French architecture, photorealistic travel photography, vibrant sky, cinematic composition", "UTF-8"),
                            48.8566, 2.3522, "April-June, September-October", "EUR", "French"),
                    createDestination("Tokyo", "Japan", "Tokyo", "A bustling metropolis blending traditional temples and modern skyscrapers.",
                            img + java.net.URLEncoder.encode("Tokyo skyline Shibuya crossing at night, neon lights, Japan cityscape, modern skyscrapers with traditional pagoda foreground, photorealistic, cinematic travel photography", "UTF-8"),
                            35.6762, 139.6503, "March-May, September-November", "JPY", "Japanese"),
                    createDestination("New York", "USA", "New York", "The city that never sleeps, home to Times Square, Central Park, and Broadway.",
                            img + java.net.URLEncoder.encode("New York Manhattan skyline sunset, Statue of Liberty, Empire State Building, yellow taxi cabs, Times Square neon billboards, photorealistic cinematic travel photography", "UTF-8"),
                            40.7128, -74.0060, "April-June, September-October", "USD", "English"),
                    createDestination("Rome", "Italy", "Rome", "The Eternal City with ancient history, Vatican City, and delicious cuisine.",
                            img + java.net.URLEncoder.encode("Colosseum Rome Italy at golden hour sunset, ancient Roman architecture, historic ruins, cobblestone streets, Vatican St Peters basilica, photorealistic travel photography", "UTF-8"),
                            41.9028, 12.4964, "April-June, September-October", "EUR", "Italian"),
                    createDestination("Bali", "Indonesia", "Denpasar", "Tropical paradise with stunning beaches, temples, and lush rice terraces.",
                            img + java.net.URLEncoder.encode("Bali Indonesia Tegalalang rice terraces sunrise, tropical paradise, ancient Hindu temple gate, palm trees, lush green landscape, photorealistic travel photography", "UTF-8"),
                            -8.3405, 115.0920, "April-October", "IDR", "Indonesian"),
                    createDestination("Taj Mahal", "India", "Agra", "A UNESCO World Heritage Site and one of the Seven Wonders of the World, built by Emperor Shah Jahan.",
                            img + java.net.URLEncoder.encode("Taj Mahal Agra India sunrise reflection pool, white marble monument, Mughal architecture, beautiful gardens, symmetrical composition, photorealistic cinematic travel photography", "UTF-8"),
                            27.1751, 78.0421, "October-March", "INR", "Hindi"),
                    createDestination("Kerala Backwaters", "India", "Alappuzha", "Serene network of lagoons, canals, and lakes in God's Own Country.",
                            img + java.net.URLEncoder.encode("Kerala backwaters India houseboat at sunset, Alleppey, palm trees, serene lagoon, coconut groves, peaceful canal, photorealistic, God's Own Country travel photography", "UTF-8"),
                            9.4981, 76.3388, "September-March", "INR", "Malayalam"),
                    createDestination("Goa Beaches", "India", "Panaji", "Sun, sand, and surf with a Portuguese touch - perfect for a beach holiday.",
                            img + java.net.URLEncoder.encode("Goa India beach sunset, Palolem beach, shacks with umbrellas, turquoise Arabian sea, coconut palm trees, Portuguese white church, photorealistic cinematic travel photography", "UTF-8"),
                            15.2993, 74.1240, "November-February", "INR", "Konkani"),
                    createDestination("Himalayas - Leh Ladakh", "India", "Leh", "Breathtaking mountain landscapes, Buddhist monasteries, and adventure sports.",
                            img + java.net.URLEncoder.encode("Leh Ladakh Himalayas India mountain landscape, snow peaks, Buddhist monastery stupa, turquoise Pangong lake, barren mountains, adventure travel photorealistic photography", "UTF-8"),
                            34.1526, 77.5771, "June-September", "INR", "Ladakhi"),
                    createDestination("Jaipur - Pink City", "India", "Jaipur", "Capital of Rajasthan, known for its palaces, forts, and vibrant culture.",
                            img + java.net.URLEncoder.encode("Jaipur Pink City India Hawa Mahal palace at sunrise, Amer Fort, vibrant pink architecture, Rajasthani culture, elephants, photorealistic cinematic travel photography", "UTF-8"),
                            26.9124, 75.7873, "October-March", "INR", "Hindi"),
                    createDestination("Varanasi", "India", "Varanasi", "The spiritual capital of India, situated on the banks of the holy Ganges.",
                            img + java.net.URLEncoder.encode("Varanasi India Ghats on Ganges river at sunrise, holy city, Hindu temples, colorful boats, spiritual aarti ceremony, golden light, photorealistic cinematic travel photography", "UTF-8"),
                            25.3176, 83.0100, "October-March", "INR", "Hindi")
            );

            List<Destination> existingDestinations = destinationRepository.findAll();

            for (Destination desired : desiredDestinations) {
                // Check if destination already exists
                Destination existing = existingDestinations.stream()
                        .filter(d -> d.getName().equals(desired.getName()))
                        .findFirst()
                        .orElse(null);
                
                if (existing != null) {
                    // Update existing destination's photo URL and other fields
                    existing.setPhotoUrl(desired.getPhotoUrl());
                    existing.setDescription(desired.getDescription());
                    existing.setBestTimeToVisit(desired.getBestTimeToVisit());
                    existing.setCurrency(desired.getCurrency());
                    existing.setLanguage(desired.getLanguage());
                    existing.setLatitude(desired.getLatitude());
                    existing.setLongitude(desired.getLongitude());
                    destinationRepository.save(existing);
                } else {
                    // Save new destination
                    destinationRepository.save(desired);
                }
            }
        } catch (java.io.UnsupportedEncodingException e) {
            // Fallback to picsum.photos if encoding fails
            List<Destination> fallbackDestinations = Arrays.asList(
                    createDestination("Paris", "France", "Paris", "The City of Light, known for the Eiffel Tower, Louvre Museum, and charming cafes.", "https://picsum.photos/id/1061/800/500", 48.8566, 2.3522, "April-June, September-October", "EUR", "French"),
                    createDestination("Tokyo", "Japan", "Tokyo", "A bustling metropolis blending traditional temples and modern skyscrapers.", "https://picsum.photos/id/1016/800/500", 35.6762, 139.6503, "March-May, September-November", "JPY", "Japanese"),
                    createDestination("New York", "USA", "New York", "The city that never sleeps, home to Times Square, Central Park, and Broadway.", "https://picsum.photos/id/1067/800/500", 40.7128, -74.0060, "April-June, September-October", "USD", "English"),
                    createDestination("Rome", "Italy", "Rome", "The Eternal City with ancient history, Vatican City, and delicious cuisine.", "https://picsum.photos/id/1048/800/500", 41.9028, 12.4964, "April-June, September-October", "EUR", "Italian"),
                    createDestination("Bali", "Indonesia", "Denpasar", "Tropical paradise with stunning beaches, temples, and lush rice terraces.", "https://picsum.photos/id/1039/800/500", -8.3405, 115.0920, "April-October", "IDR", "Indonesian"),
                    createDestination("Taj Mahal", "India", "Agra", "A UNESCO World Heritage Site and one of the Seven Wonders of the World, built by Emperor Shah Jahan.", "https://picsum.photos/id/1025/800/500", 27.1751, 78.0421, "October-March", "INR", "Hindi"),
                    createDestination("Kerala Backwaters", "India", "Alappuzha", "Serene network of lagoons, canals, and lakes in God's Own Country.", "https://picsum.photos/id/1029/800/500", 9.4981, 76.3388, "September-March", "INR", "Malayalam"),
                    createDestination("Goa Beaches", "India", "Panaji", "Sun, sand, and surf with a Portuguese touch - perfect for a beach holiday.", "https://picsum.photos/id/1027/800/500", 15.2993, 74.1240, "November-February", "INR", "Konkani"),
                    createDestination("Himalayas - Leh Ladakh", "India", "Leh", "Breathtaking mountain landscapes, Buddhist monasteries, and adventure sports.", "https://picsum.photos/id/119/800/500", 34.1526, 77.5771, "June-September", "INR", "Ladakhi"),
                    createDestination("Jaipur - Pink City", "India", "Jaipur", "Capital of Rajasthan, known for its palaces, forts, and vibrant culture.", "https://picsum.photos/id/1019/800/500", 26.9124, 75.7873, "October-March", "INR", "Hindi"),
                    createDestination("Varanasi", "India", "Varanasi", "The spiritual capital of India, situated on the banks of the holy Ganges.", "https://picsum.photos/id/1015/800/500", 25.3176, 83.0100, "October-March", "INR", "Hindi")
            );
            List<Destination> existingDestinations = destinationRepository.findAll();
            for (Destination desired : fallbackDestinations) {
                Destination existing = existingDestinations.stream()
                        .filter(d -> d.getName().equals(desired.getName()))
                        .findFirst()
                        .orElse(null);
                if (existing != null) {
                    existing.setPhotoUrl(desired.getPhotoUrl());
                    existing.setDescription(desired.getDescription());
                    existing.setBestTimeToVisit(desired.getBestTimeToVisit());
                    existing.setCurrency(desired.getCurrency());
                    existing.setLanguage(desired.getLanguage());
                    existing.setLatitude(desired.getLatitude());
                    existing.setLongitude(desired.getLongitude());
                    destinationRepository.save(existing);
                } else {
                    destinationRepository.save(desired);
                }
            }
        }
    }

    private void seedUsers() {
        createUserIfNotExists("admin@tripnest.com", "admin123", "Admin", "User", Role.ADMINISTRATOR, "+1-555-0100");
        createUserIfNotExists("traveler@tripnest.com", "traveler123", "Jane", "Traveler", Role.TRAVELER, "+1-555-0101");
        createUserIfNotExists("groupadmin@tripnest.com", "group123", "Group", "Admin", Role.GROUP_ADMIN, "+1-555-0102");
    }

    private void createUserIfNotExists(String email, String rawPassword, String firstName, String lastName, Role role, String phone) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(role);
            user.setPhone(phone);
            user.setActive(true);
            userRepository.save(user);
        }
    }

    private Destination createDestination(String name, String country, String city, String description, String photoUrl, double lat, double lng, String bestTime, String currency, String language) {
        Destination d = new Destination();
        d.setName(name);
        d.setCountry(country);
        d.setCity(city);
        d.setDescription(description);
        d.setPhotoUrl(photoUrl);
        d.setLatitude(lat);
        d.setLongitude(lng);
        d.setBestTimeToVisit(bestTime);
        d.setCurrency(currency);
        d.setLanguage(language);
        return d;
    }
}
