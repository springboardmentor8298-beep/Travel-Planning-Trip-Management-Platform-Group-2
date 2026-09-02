package com.tripnest.config;

import com.tripnest.entity.Destination;
import com.tripnest.entity.Role;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final DestinationRepository destinationRepository;

    public DataInitializer(RoleRepository roleRepository,
                           DestinationRepository destinationRepository) {
        this.roleRepository = roleRepository;
        this.destinationRepository = destinationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        if (roleRepository.findByRoleName("USER").isEmpty()) {
            Role userRole = new Role();
            userRole.setRoleName("USER");
            roleRepository.save(userRole);
        }
        if (roleRepository.findByRoleName("ADMIN").isEmpty()) {
            Role adminRole = new Role();
            adminRole.setRoleName("ADMIN");
            roleRepository.save(adminRole);
        }

        // 2. Seed Destinations (for Module 2)
        if (destinationRepository.count() == 0) {
            Destination paris = new Destination();
            paris.setDestinationName("Paris, France");
            paris.setCity("Paris");
            paris.setState("Île-de-France");
            paris.setCountry("France");
            paris.setDescription("The city of lights, love, fashion, and gourmet culinary experiences.");
            paris.setAttractions("Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, Arc de Triomphe");
            paris.setWeatherInfo("Temperate: Spring (15°C - 20°C) is ideal; Winter is cool (5°C - 8°C).");
            paris.setTravelGuide("Purchase a Paris Visite Pass for unlimited metro access. Enjoy pastries at local boulangeries.");
            
            Destination maldives = new Destination();
            maldives.setDestinationName("Maldives");
            maldives.setCity("Male");
            maldives.setState("Kaafu Atoll");
            maldives.setCountry("Maldives");
            maldives.setDescription("A tropical paradise of pristine white sand beaches, clear turquoise lagoons, and luxury overwater villas.");
            maldives.setAttractions("Banana Reef, Maafushi Island, Male Fish Market, HP Reef");
            maldives.setWeatherInfo("Tropical: Sunny all year (28°C - 31°C). Monsoon season is May to November.");
            maldives.setTravelGuide("Take speedboats or seaplanes for inter-island transfers. Sunscreen and swimwear are essential.");

            Destination tokyo = new Destination();
            tokyo.setDestinationName("Tokyo, Japan");
            tokyo.setCity("Tokyo");
            tokyo.setState("Kanto");
            tokyo.setCountry("Japan");
            tokyo.setDescription("A futuristic metropolis where ultra-modern skyscrapers stand alongside historic shrines.");
            tokyo.setAttractions("Shibuya Crossing, Senso-ji Temple, Tokyo Skytree, Meiji Jingu Shrine");
            tokyo.setWeatherInfo("Four Seasons: Spring (15°C) for cherry blossoms; Autumn (18°C) for foliage.");
            tokyo.setTravelGuide("Get a Suica or Pasmo IC card for easy train transfers. Cash is still preferred in small shops.");

            Destination newYork = new Destination();
            newYork.setDestinationName("New York City, USA");
            newYork.setCity("New York City");
            newYork.setState("New York");
            newYork.setCountry("United States");
            newYork.setDescription("The city that never sleeps, featuring Broadway shows, world-class museums, and iconic landmarks.");
            newYork.setAttractions("Statue of Liberty, Times Square, Central Park, Empire State Building");
            newYork.setWeatherInfo("Continental: Hot summers (28°C) and snowy winters (-2°C). Spring/Autumn are mild.");
            newYork.setTravelGuide("Use the Subway for fast city travels. Book Broadway tickets in advance or visit TKTS booths.");

            Destination rome = new Destination();
            rome.setDestinationName("Rome, Italy");
            rome.setCity("Rome");
            rome.setState("Lazio");
            rome.setCountry("Italy");
            rome.setDescription("An open-air museum filled with ancient ruins, Renaissance art, and vibrant piazza life.");
            rome.setAttractions("Colosseum, Vatican Museums, Trevi Fountain, Pantheon");
            rome.setWeatherInfo("Mediterranean: Hot, dry summers (30°C) and mild, wet winters (10°C).");
            rome.setTravelGuide("Carry a refillable water bottle; public fountains (nasoni) offer cold drinking water. Respect church dress codes.");

            destinationRepository.saveAll(Arrays.asList(paris, maldives, tokyo, newYork, rome));
        }
    }
}
