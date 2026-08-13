package com.tripnest.config;

import com.tripnest.model.Destination;
import com.tripnest.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DestinationRepository destinationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (destinationRepository.count() == 0) {
            Destination d1 = new Destination(
                    null,
                    "Goa",
                    "India",
                    "Famous for pristine sandy beaches, vibrant nightlife, water sports, and Portuguese colonial architecture.",
                    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
                    "November – February",
                    "₹15,000 – ₹35,000",
                    "Beach & Nightlife"
            );

            Destination d2 = new Destination(
                    null,
                    "Ooty",
                    "India",
                    "Known as the Queen of Hill Stations, featuring serene tea gardens, Nilgiri Toy Train, and lush botanical gardens.",
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600",
                    "October – June",
                    "₹10,000 – ₹25,000",
                    "Hill Station & Nature"
            );

            Destination d3 = new Destination(
                    null,
                    "Manali",
                    "India",
                    "High-altitude Himalayan resort town known for snow-capped mountain vistas, paragliding, and Solang Valley adventures.",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                    "October – June",
                    "₹20,000 – ₹45,000",
                    "Adventure & Mountains"
            );

            Destination d4 = new Destination(
                    null,
                    "Kerala Backwaters",
                    "India",
                    "Experience tranquil houseboat cruises through palm-fringed backwaters, spice plantations, and Ayurvedic wellness.",
                    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600",
                    "September – March",
                    "₹18,000 – ₹40,000",
                    "Relaxation & Culture"
            );

            Destination d5 = new Destination(
                    null,
                    "Jaipur",
                    "India",
                    "The iconic Pink City featuring majestic palaces like Hawa Mahal, Amer Fort, vibrant bazaars, and royal heritage.",
                    "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600",
                    "October – March",
                    "₹12,000 – ₹30,000",
                    "Heritage & Culture"
            );

            destinationRepository.saveAll(Arrays.asList(d1, d2, d3, d4, d5));
            System.out.println("✅ Initialized 5 sample destinations in database.");
        }
    }
}
