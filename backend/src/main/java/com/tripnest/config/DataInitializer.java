package com.tripnest.config;

import java.time.LocalDateTime;
import com.tripnest.entity.Activity;
import com.tripnest.entity.Budget;
import com.tripnest.entity.Destination;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Notification;
import com.tripnest.entity.Role;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.BudgetRepository;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.NotificationRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final ItineraryRepository itineraryRepository;
    private final ActivityRepository activityRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(DestinationRepository destinationRepository,
                           UserRepository userRepository,
                           TripRepository tripRepository,
                           ItineraryRepository itineraryRepository,
                           ActivityRepository activityRepository,
                           BudgetRepository budgetRepository,
                           ExpenseRepository expenseRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.destinationRepository = destinationRepository;
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
        this.itineraryRepository = itineraryRepository;
        this.activityRepository = activityRepository;
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        User traveler = userRepository.findByEmail("traveler@tripnest.com").orElse(null);
        User groupAdmin = userRepository.findByEmail("groupadmin@tripnest.com").orElse(null);
        User admin = userRepository.findByEmail("admin@tripnest.com").orElse(null);

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

        if (traveler != null) {
            seedTripsBudgetsAndExpenses(traveler, groupAdmin, admin);
            seedNotifications(traveler, groupAdmin, admin);
        }
    }

    private void seedTripsBudgetsAndExpenses(User traveler, User groupAdmin, User admin) {
        String img = "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?image_size=landscape_16_9&prompt=";
        try {
            Optional<Destination> goaDest = destinationRepository.findAll().stream()
                    .filter(d -> d.getName().equals("Goa Beaches")).findFirst();
            Optional<Destination> keralaDest = destinationRepository.findAll().stream()
                    .filter(d -> d.getName().equals("Kerala Backwaters")).findFirst();
            Optional<Destination> jaipurDest = destinationRepository.findAll().stream()
                    .filter(d -> d.getName().equals("Jaipur - Pink City")).findFirst();
            Optional<Destination> baliDest = destinationRepository.findAll().stream()
                    .filter(d -> d.getName().equals("Bali")).findFirst();
            Optional<Destination> parisDest = destinationRepository.findAll().stream()
                    .filter(d -> d.getName().equals("Paris")).findFirst();

            Trip goaTrip = createTripIfNotExists(
                    "Goa Beach Adventure",
                    "A fun-filled beach vacation with friends exploring Goan beaches, nightlife, and Portuguese heritage.",
                    LocalDate.of(2026, 12, 20),
                    LocalDate.of(2026, 12, 27),
                    img + java.net.URLEncoder.encode("Goa India beach vacation group friends sunset party, tropical paradise, beach umbrellas, Arabian sea, photorealistic travel photography", "UTF-8"),
                    "planning",
                    traveler,
                    goaDest.orElse(null)
            );

            Trip keralaTrip = createTripIfNotExists(
                    "Kerala Backwaters Retreat",
                    "Peaceful houseboat cruise through the serene backwaters of Kerala, visiting lush villages and spice gardens.",
                    LocalDate.of(2027, 1, 15),
                    LocalDate.of(2027, 1, 22),
                    img + java.net.URLEncoder.encode("Kerala backwaters houseboat luxury cruise at sunset, Alleppey palm trees lagoon, peaceful tropical vacation, photorealistic travel photography", "UTF-8"),
                    "confirmed",
                    traveler,
                    keralaDest.orElse(null)
            );

            Trip jaipurTrip = createTripIfNotExists(
                    "Rajasthan Heritage Tour",
                    "Explore the majestic forts, palaces, and vibrant culture of the Pink City with the family group.",
                    LocalDate.of(2026, 10, 10),
                    LocalDate.of(2026, 10, 14),
                    img + java.net.URLEncoder.encode("Jaipur Rajasthan Amer Fort heritage palace at sunset, elephants, vibrant Indian culture, family vacation, photorealistic travel photography", "UTF-8"),
                    "completed",
                    groupAdmin,
                    jaipurDest.orElse(null)
            );

            Trip baliTrip = createTripIfNotExists(
                    "Bali Honeymoon Escape",
                    "Romantic honeymoon getaway in tropical Bali with private villa, beach dinners, and temple visits.",
                    LocalDate.of(2027, 2, 14),
                    LocalDate.of(2027, 2, 24),
                    img + java.net.URLEncoder.encode("Bali Indonesia romantic honeymoon villa pool sunset, tropical flowers, luxury resort, Ubud rice terraces, photorealistic travel photography", "UTF-8"),
                    "planning",
                    traveler,
                    baliDest.orElse(null)
            );

            Trip parisTrip = createTripIfNotExists(
                    "Paris European Adventure",
                    "Solo backpacking trip across Paris exploring art, cuisine, and iconic landmarks.",
                    LocalDate.of(2027, 4, 5),
                    LocalDate.of(2027, 4, 15),
                    img + java.net.URLEncoder.encode("Paris Eiffel Tower romantic sunset street cafe, French architecture, backpacker adventure travel, photorealistic cinematic photography", "UTF-8"),
                    "draft",
                    traveler,
                    parisDest.orElse(null)
            );

            createBudgetIfNotExists(goaTrip, new BigDecimal("80000.00"),
                    new BigDecimal("35000.00"), new BigDecimal("18000.00"),
                    new BigDecimal("12000.00"), new BigDecimal("10000.00"),
                    new BigDecimal("5000.00"), "INR");
            createBudgetIfNotExists(keralaTrip, new BigDecimal("120000.00"),
                    new BigDecimal("55000.00"), new BigDecimal("25000.00"),
                    new BigDecimal("18000.00"), new BigDecimal("15000.00"),
                    new BigDecimal("7000.00"), "INR");
            createBudgetIfNotExists(jaipurTrip, new BigDecimal("60000.00"),
                    new BigDecimal("28000.00"), new BigDecimal("12000.00"),
                    new BigDecimal("10000.00"), new BigDecimal("7000.00"),
                    new BigDecimal("3000.00"), "INR");
            createBudgetIfNotExists(baliTrip, new BigDecimal("250000.00"),
                    new BigDecimal("120000.00"), new BigDecimal("60000.00"),
                    new BigDecimal("35000.00"), new BigDecimal("25000.00"),
                    new BigDecimal("10000.00"), "INR");
            createBudgetIfNotExists(parisTrip, new BigDecimal("350000.00"),
                    new BigDecimal("150000.00"), new BigDecimal("100000.00"),
                    new BigDecimal("50000.00"), new BigDecimal("35000.00"),
                    new BigDecimal("15000.00"), "INR");

            Budget goaBudget = budgetRepository.findByTripId(goaTrip.getId()).orElse(null);
            Budget keralaBudget = budgetRepository.findByTripId(keralaTrip.getId()).orElse(null);
            Budget jaipurBudget = budgetRepository.findByTripId(jaipurTrip.getId()).orElse(null);

            if (goaBudget != null) {
                createExpenseIfNotExists(goaTrip, goaBudget, "Accommodation", "Beach resort booking deposit - 4 nights",
                        new BigDecimal("17500.00"), "INR", LocalDate.of(2026, 12, 10), true);
                createExpenseIfNotExists(goaTrip, goaBudget, "Transportation", "Flight tickets Mumbai-Goa round trip",
                        new BigDecimal("12000.00"), "INR", LocalDate.of(2026, 12, 1), true);
                createExpenseIfNotExists(goaTrip, goaBudget, "Activities", "Water sports package - parasailing, jet ski, scuba",
                        new BigDecimal("8000.00"), "INR", LocalDate.of(2026, 12, 15), false);
                createExpenseIfNotExists(goaTrip, goaBudget, "Food", "Restaurants and cafe reservations advance",
                        new BigDecimal("5000.00"), "INR", LocalDate.of(2026, 12, 18), false);
                createExpenseIfNotExists(goaTrip, goaBudget, "Other", "Travel insurance for 4 people",
                        new BigDecimal("3000.00"), "INR", LocalDate.of(2026, 11, 28), true);
                createExpenseIfNotExists(goaTrip, goaBudget, "Transportation", "Private taxi for local sightseeing",
                        new BigDecimal("4500.00"), "INR", LocalDate.of(2026, 12, 5), false);
            }

            if (keralaBudget != null) {
                createExpenseIfNotExists(keralaTrip, keralaBudget, "Accommodation", "Luxury houseboat booking - 3 nights full board",
                        new BigDecimal("45000.00"), "INR", LocalDate.of(2027, 1, 2), true);
                createExpenseIfNotExists(keralaTrip, keralaBudget, "Accommodation", "Lake resort pre and post cruise stay",
                        new BigDecimal("12000.00"), "INR", LocalDate.of(2027, 1, 5), true);
                createExpenseIfNotExists(keralaTrip, keralaBudget, "Transportation", "Train tickets + pickup/drop cab",
                        new BigDecimal("22000.00"), "INR", LocalDate.of(2027, 1, 1), true);
                createExpenseIfNotExists(keralaTrip, keralaBudget, "Activities", "Spice garden tour + Kathakali dance + Ayurvedic spa",
                        new BigDecimal("12000.00"), "INR", LocalDate.of(2027, 1, 10), false);
                createExpenseIfNotExists(keralaTrip, keralaBudget, "Food", "Traditional Kerala sadya and seafood dining",
                        new BigDecimal("8000.00"), "INR", LocalDate.of(2027, 1, 16), false);
            }

            if (jaipurBudget != null) {
                createExpenseIfNotExists(jaipurTrip, jaipurBudget, "Accommodation", "Heritage palace hotel - 4 nights",
                        new BigDecimal("28000.00"), "INR", LocalDate.of(2026, 10, 8), true);
                createExpenseIfNotExists(jaipurTrip, jaipurBudget, "Transportation", "Train + local sightseeing cab",
                        new BigDecimal("12000.00"), "INR", LocalDate.of(2026, 10, 1), true);
                createExpenseIfNotExists(jaipurTrip, jaipurBudget, "Activities", "Amer fort elephant ride, City Palace, Hawa Mahal tickets",
                        new BigDecimal("7000.00"), "INR", LocalDate.of(2026, 10, 10), true);
                createExpenseIfNotExists(jaipurTrip, jaipurBudget, "Food", "Royal Rajasthani thali dinners",
                        new BigDecimal("9500.00"), "INR", LocalDate.of(2026, 10, 12), true);
                createExpenseIfNotExists(jaipurTrip, jaipurBudget, "Other", "Traditional handicraft shopping",
                        new BigDecimal("2800.00"), "INR", LocalDate.of(2026, 10, 13), true);
            }

            if (goaTrip.getId() != null) {
                List<Itinerary> goaItineraries = itineraryRepository.findByTrip(goaTrip);
                if (goaItineraries.isEmpty()) {
                    Itinerary day1 = createItinerary(goaTrip, LocalDate.of(2026, 12, 20), "Arrival & Beach Exploration",
                            "Reach Goa, check-in at resort, relax at Calangute Beach in evening", goaDest.orElse(null));
                    createActivity(day1, "Airport Pickup", "Private cab from Dabolim airport to resort",
                            LocalTime.of(11, 0), LocalTime.of(12, 0), "Dabolim Airport", 1500.0, "Transportation", goaDest.orElse(null));
                    createActivity(day1, "Check-in & Lunch", "Resort check-in followed by welcome lunch",
                            LocalTime.of(13, 0), LocalTime.of(15, 0), "Beach Resort, Calangute", 0.0, "Food", goaDest.orElse(null));
                    createActivity(day1, "Calangute & Baga Beach Walk", "Evening stroll at famous beaches, sunset view",
                            LocalTime.of(17, 0), LocalTime.of(19, 30), "Calangute Beach", 0.0, "Activity", goaDest.orElse(null));

                    Itinerary day2 = createItinerary(goaTrip, LocalDate.of(2026, 12, 21), "North Goa Water Sports Day",
                            "Full day water sports adventure at Sinquerim and Candolim", goaDest.orElse(null));
                    createActivity(day2, "Breakfast at Resort", "Buffet breakfast with Goan specialties",
                            LocalTime.of(8, 0), LocalTime.of(9, 30), "Resort Restaurant", 0.0, "Food", goaDest.orElse(null));
                    createActivity(day2, "Water Sports Combo", "Parasailing, Jet Ski, Banana Boat, Speed Boat Ride",
                            LocalTime.of(10, 30), LocalTime.of(14, 0), "Sinquerim Beach", 8000.0, "Activity", goaDest.orElse(null));

                    Itinerary day3 = createItinerary(goaTrip, LocalDate.of(2026, 12, 22), "Old Goa Heritage Tour",
                            "Churches of Old Goa, Panjim city tour, Latin Quarter evening", goaDest.orElse(null));
                    createActivity(day3, "Basilica of Bom Jesus", "UNESCO World Heritage Site visit",
                            LocalTime.of(10, 0), LocalTime.of(12, 0), "Old Goa", 500.0, "Activity", goaDest.orElse(null));
                    createActivity(day3, "Fontainhas Latin Quarter Walk", "Colorful Portuguese houses, art galleries, cafes",
                            LocalTime.of(16, 0), LocalTime.of(19, 0), "Fontainhas, Panjim", 1000.0, "Activity", goaDest.orElse(null));
                }
            }

            if (jaipurTrip.getId() != null) {
                List<Itinerary> jaipurItineraries = itineraryRepository.findByTrip(jaipurTrip);
                if (jaipurItineraries.isEmpty()) {
                    Itinerary jday1 = createItinerary(jaipurTrip, LocalDate.of(2026, 10, 10), "Arrival & City Palace Tour",
                            "Arrive in Jaipur, check-in, explore City Palace and Jantar Mantar", jaipurDest.orElse(null));
                    createActivity(jday1, "City Palace & Chandra Mahal", "Royal palace museum tour",
                            LocalTime.of(14, 0), LocalTime.of(17, 0), "City Palace, Jaipur", 2500.0, "Activity", jaipurDest.orElse(null));
                    createActivity(jday1, "Jantar Mantar", "Astronomical observatory UNESCO site",
                            LocalTime.of(17, 30), LocalTime.of(18, 30), "Jantar Mantar, Jaipur", 1000.0, "Activity", jaipurDest.orElse(null));

                    Itinerary jday2 = createItinerary(jaipurTrip, LocalDate.of(2026, 10, 11), "Amer Fort & Elephant Ride",
                            "Morning Amer Fort tour via elephant, Panna Meena ka Kund stepwell, Jal Mahal sunset", jaipurDest.orElse(null));
                    createActivity(jday2, "Amer Fort Elephant Ride & Tour", "Elephant ride uphill, explore Amber Palace, Sheesh Mahal",
                            LocalTime.of(9, 0), LocalTime.of(13, 0), "Amer Fort", 3500.0, "Activity", jaipurDest.orElse(null));
                }
            }

        } catch (java.io.UnsupportedEncodingException e) {
            seedFallbackTripsBudgetsAndExpenses(traveler, groupAdmin, admin);
        }
    }

    private void seedFallbackTripsBudgetsAndExpenses(User traveler, User groupAdmin, User admin) {
        Optional<Destination> goaDest = destinationRepository.findAll().stream()
                .filter(d -> d.getName().equals("Goa Beaches")).findFirst();
        Optional<Destination> keralaDest = destinationRepository.findAll().stream()
                .filter(d -> d.getName().equals("Kerala Backwaters")).findFirst();
        Optional<Destination> jaipurDest = destinationRepository.findAll().stream()
                .filter(d -> d.getName().equals("Jaipur - Pink City")).findFirst();
        Optional<Destination> baliDest = destinationRepository.findAll().stream()
                .filter(d -> d.getName().equals("Bali")).findFirst();
        Optional<Destination> parisDest = destinationRepository.findAll().stream()
                .filter(d -> d.getName().equals("Paris")).findFirst();

        Trip goaTrip = createTripIfNotExists(
                "Goa Beach Adventure",
                "A fun-filled beach vacation with friends exploring Goan beaches, nightlife, and Portuguese heritage.",
                LocalDate.of(2026, 12, 20),
                LocalDate.of(2026, 12, 27),
                "https://picsum.photos/id/1027/800/500",
                "planning",
                traveler,
                goaDest.orElse(null)
        );

        Trip keralaTrip = createTripIfNotExists(
                "Kerala Backwaters Retreat",
                "Peaceful houseboat cruise through the serene backwaters of Kerala.",
                LocalDate.of(2027, 1, 15),
                LocalDate.of(2027, 1, 22),
                "https://picsum.photos/id/1029/800/500",
                "confirmed",
                traveler,
                keralaDest.orElse(null)
        );

        Trip jaipurTrip = createTripIfNotExists(
                "Rajasthan Heritage Tour",
                "Explore the majestic forts, palaces, and vibrant culture of the Pink City.",
                LocalDate.of(2026, 10, 10),
                LocalDate.of(2026, 10, 14),
                "https://picsum.photos/id/1019/800/500",
                "completed",
                groupAdmin,
                jaipurDest.orElse(null)
        );

        Trip baliTrip = createTripIfNotExists(
                "Bali Honeymoon Escape",
                "Romantic honeymoon getaway in tropical Bali.",
                LocalDate.of(2027, 2, 14),
                LocalDate.of(2027, 2, 24),
                "https://picsum.photos/id/1039/800/500",
                "planning",
                traveler,
                baliDest.orElse(null)
        );

        Trip parisTrip = createTripIfNotExists(
                "Paris European Adventure",
                "Solo backpacking trip across Paris.",
                LocalDate.of(2027, 4, 5),
                LocalDate.of(2027, 4, 15),
                "https://picsum.photos/id/1061/800/500",
                "draft",
                traveler,
                parisDest.orElse(null)
        );

        createBudgetIfNotExists(goaTrip, new BigDecimal("80000.00"),
                new BigDecimal("35000.00"), new BigDecimal("18000.00"),
                new BigDecimal("12000.00"), new BigDecimal("10000.00"),
                new BigDecimal("5000.00"), "INR");
        createBudgetIfNotExists(keralaTrip, new BigDecimal("120000.00"),
                new BigDecimal("55000.00"), new BigDecimal("25000.00"),
                new BigDecimal("18000.00"), new BigDecimal("15000.00"),
                new BigDecimal("7000.00"), "INR");
        createBudgetIfNotExists(jaipurTrip, new BigDecimal("60000.00"),
                new BigDecimal("28000.00"), new BigDecimal("12000.00"),
                new BigDecimal("10000.00"), new BigDecimal("7000.00"),
                new BigDecimal("3000.00"), "INR");
        createBudgetIfNotExists(baliTrip, new BigDecimal("250000.00"),
                new BigDecimal("120000.00"), new BigDecimal("60000.00"),
                new BigDecimal("35000.00"), new BigDecimal("25000.00"),
                new BigDecimal("10000.00"), "INR");
        createBudgetIfNotExists(parisTrip, new BigDecimal("350000.00"),
                new BigDecimal("150000.00"), new BigDecimal("100000.00"),
                new BigDecimal("50000.00"), new BigDecimal("35000.00"),
                new BigDecimal("15000.00"), "INR");

        Budget goaBudget = budgetRepository.findByTripId(goaTrip.getId()).orElse(null);
        Budget keralaBudget = budgetRepository.findByTripId(keralaTrip.getId()).orElse(null);
        Budget jaipurBudget = budgetRepository.findByTripId(jaipurTrip.getId()).orElse(null);

        if (goaBudget != null) {
            createExpenseIfNotExists(goaTrip, goaBudget, "Accommodation", "Beach resort booking deposit - 4 nights",
                    new BigDecimal("17500.00"), "INR", LocalDate.of(2026, 12, 10), true);
            createExpenseIfNotExists(goaTrip, goaBudget, "Transportation", "Flight tickets round trip",
                    new BigDecimal("12000.00"), "INR", LocalDate.of(2026, 12, 1), true);
            createExpenseIfNotExists(goaTrip, goaBudget, "Activities", "Water sports package",
                    new BigDecimal("8000.00"), "INR", LocalDate.of(2026, 12, 15), false);
            createExpenseIfNotExists(goaTrip, goaBudget, "Food", "Restaurant reservations advance",
                    new BigDecimal("5000.00"), "INR", LocalDate.of(2026, 12, 18), false);
            createExpenseIfNotExists(goaTrip, goaBudget, "Other", "Travel insurance for 4",
                    new BigDecimal("3000.00"), "INR", LocalDate.of(2026, 11, 28), true);
            createExpenseIfNotExists(goaTrip, goaBudget, "Transportation", "Private taxi sightseeing",
                    new BigDecimal("4500.00"), "INR", LocalDate.of(2026, 12, 5), false);
        }

        if (keralaBudget != null) {
            createExpenseIfNotExists(keralaTrip, keralaBudget, "Accommodation", "Luxury houseboat booking 3 nights",
                    new BigDecimal("45000.00"), "INR", LocalDate.of(2027, 1, 2), true);
            createExpenseIfNotExists(keralaTrip, keralaBudget, "Transportation", "Train tickets + cab",
                    new BigDecimal("22000.00"), "INR", LocalDate.of(2027, 1, 1), true);
            createExpenseIfNotExists(keralaTrip, keralaBudget, "Activities", "Spice tour + Kathakali + Spa",
                    new BigDecimal("12000.00"), "INR", LocalDate.of(2027, 1, 10), false);
        }

        if (jaipurBudget != null) {
            createExpenseIfNotExists(jaipurTrip, jaipurBudget, "Accommodation", "Heritage palace hotel 4 nights",
                    new BigDecimal("28000.00"), "INR", LocalDate.of(2026, 10, 8), true);
            createExpenseIfNotExists(jaipurTrip, jaipurBudget, "Transportation", "Train + local cab",
                    new BigDecimal("12000.00"), "INR", LocalDate.of(2026, 10, 1), true);
            createExpenseIfNotExists(jaipurTrip, jaipurBudget, "Activities", "Forts and palaces entry tickets",
                    new BigDecimal("7000.00"), "INR", LocalDate.of(2026, 10, 10), true);
            createExpenseIfNotExists(jaipurTrip, jaipurBudget, "Food", "Rajasthani thali dinners",
                    new BigDecimal("9500.00"), "INR", LocalDate.of(2026, 10, 12), true);
        }
    }

    private void seedNotifications(User traveler, User groupAdmin, User admin) {
        if (traveler != null && notificationRepository.findByUserIdOrderByCreatedAtDesc(traveler.getId()).isEmpty()) {
            List<Trip> trips = tripRepository.findByUser(traveler);
            Trip firstTrip = trips.isEmpty() ? null : trips.get(0);
            Long tripId = firstTrip != null ? firstTrip.getId() : null;

            createNotification(traveler, "TRIP_INVITE", "New Group Trip Invite!",
                    "You have been invited to join 'Summer Adventure' trip by Group Admin. Review the itinerary and confirm your participation.",
                    tripId, false, null);
            createNotification(traveler, "BUDGET_ALERT", "Budget Limit Warning",
                    "Your 'Goa Beach Adventure' accommodation expenses have reached 50% of allocated budget. Consider reviewing other bookings.",
                    tripId, false, null);
            createNotification(traveler, "EXPENSE_ADDED", "New Expense Recorded",
                    "An expense of Rs. 12,000 for Flight tickets has been added to your Goa Beach Adventure trip by group member.",
                    tripId, false, null);
            createNotification(traveler, "ITINERARY_UPDATE", "Itinerary Updated",
                    "The Day 3 itinerary for Kerala trip has been modified - new spice garden tour added at 10 AM.",
                    trips.size() > 1 ? trips.get(1).getId() : null, false, null);
            createNotification(traveler, "WEATHER_ALERT", "Weather Advisory",
                    "Weather alert for your Goa trip: Light rain expected on Day 3. Consider moving water activities to Day 4.",
                    tripId, false, null);
            createNotification(traveler, "PAYMENT_REMINDER", "Upcoming Payment Due",
                    "Reminder: Final balance payment of Rs. 17,500 for Goa resort is due on Dec 15, 2026.",
                    tripId, false, null);
            createNotification(traveler, "DOCUMENT_SHARED", "Document Shared",
                    "Group Admin has shared 'Travel_Itinerary_Goa_2026.pdf' document with the group. View in documents section.",
                    tripId, false, null);
        }

        if (groupAdmin != null && notificationRepository.findByUserIdOrderByCreatedAtDesc(groupAdmin.getId()).isEmpty()) {
            List<Trip> adminTrips = tripRepository.findByUser(groupAdmin);
            Long aTripId = adminTrips.isEmpty() ? null : adminTrips.get(0).getId();

            createNotification(groupAdmin, "MEMBER_ACCEPTED", "Trip Member Joined",
                    "Jane Traveler has accepted the invitation to join 'Rajasthan Heritage Tour'. Current group size: 6.",
                    aTripId, false, null);
            createNotification(groupAdmin, "EXPENSE_APPROVAL", "Expense Approval Request",
                    "New expense request Rs. 2,500 for 'Traditional handicraft shopping' needs your review and approval.",
                    aTripId, false, null);
            createNotification(groupAdmin, "TRIP_COMPLETE", "Trip Completed",
                    "Congratulations! 'Rajasthan Heritage Tour' has been marked as completed. View the trip summary and share memories.",
                    aTripId, false, null);
        }

        if (admin != null && notificationRepository.findByUserIdOrderByCreatedAtDesc(admin.getId()).isEmpty()) {
            createNotification(admin, "SYSTEM", "Welcome Admin",
                    "Thank you for using TripNest! System dashboard shows 12 active users and 5 upcoming trips this month.",
                    null, false, null);
            createNotification(admin, "SYSTEM", "Monthly Report Available",
                    "October 2026 platform analytics report is ready. 25 new registrations, 18 trips created, 82% user satisfaction rate.",
                    null, false, null);
        }
    }

    private Trip createTripIfNotExists(String name, String description, LocalDate start, LocalDate end,
                                       String photoUrl, String status, User user, Destination destination) {
        List<Trip> userTrips = tripRepository.findByUser(user);
        Trip existing = userTrips.stream()
                .filter(t -> t.getName().equals(name))
                .findFirst()
                .orElse(null);
        if (existing != null) {
            return existing;
        }
        Trip trip = new Trip();
        trip.setName(name);
        trip.setDescription(description);
        trip.setStartDate(start);
        trip.setEndDate(end);
        trip.setPhotoUrl(photoUrl);
        trip.setStatus(status);
        trip.setUser(user);
        trip.setDestination(destination);
        return tripRepository.save(trip);
    }

    private void createBudgetIfNotExists(Trip trip, BigDecimal total, BigDecimal accm, BigDecimal trans,
                                         BigDecimal food, BigDecimal activities, BigDecimal other, String currency) {
        if (trip == null || trip.getId() == null) return;
        Optional<Budget> existing = budgetRepository.findByTripId(trip.getId());
        if (existing.isPresent()) return;
        Budget budget = new Budget();
        budget.setTrip(trip);
        budget.setTotalAmount(total);
        budget.setAccommodation(accm);
        budget.setTransportation(trans);
        budget.setFood(food);
        budget.setActivities(activities);
        budget.setOther(other);
        budget.setCurrency(currency);
        budgetRepository.save(budget);
    }

    private void createExpenseIfNotExists(Trip trip, Budget budget, String category, String description,
                                          BigDecimal amount, String currency, LocalDate expenseDate, boolean isPaid) {
        if (trip == null || trip.getId() == null) return;
        List<Expense> existing = expenseRepository.findByTripIdOrderByExpenseDateDesc(trip.getId());
        boolean found = existing.stream()
                .anyMatch(e -> e.getDescription().equals(description) && e.getAmount().compareTo(amount) == 0);
        if (found) return;
        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setBudget(budget);
        expense.setCategory(category);
        expense.setDescription(description);
        expense.setAmount(amount);
        expense.setCurrency(currency);
        expense.setExpenseDate(expenseDate);
        expense.setIsPaid(isPaid);
        expenseRepository.save(expense);
    }

    private Itinerary createItinerary(Trip trip, LocalDate date, String title, String notes, Destination destination) {
        Itinerary itin = new Itinerary();
        itin.setTrip(trip);
        itin.setDate(date);
        itin.setTitle(title);
        itin.setNotes(notes);
        itin.setDestination(destination);
        return itineraryRepository.save(itin);
    }

    private void createActivity(Itinerary itinerary, String name, String description,
                                LocalTime start, LocalTime end, String location,
                                Double cost, String category, Destination destination) {
        Activity activity = new Activity();
        activity.setName(name);
        activity.setDescription(description);
        activity.setStartTime(start);
        activity.setEndTime(end);
        activity.setLocation(location);
        activity.setCost(cost);
        activity.setCategory(category);
        activity.setItinerary(itinerary);
        activity.setDestination(destination);
        activityRepository.save(activity);
    }

    private void createNotification(User user, String type, String title, String message,
                                    Long tripId, boolean isRead, LocalDateTime readAt) {
        Notification notif = new Notification();
        notif.setUser(user);
        notif.setType(type);
        notif.setTitle(title);
        notif.setMessage(message);
        notif.setTripId(tripId);
        notif.setIsRead(isRead);
        notif.setReadAt(readAt);
        notificationRepository.save(notif);
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
