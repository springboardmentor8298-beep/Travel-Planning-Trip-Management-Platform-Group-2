package com.tripnest.config;

import com.tripnest.entity.Role;
import com.tripnest.entity.Destination;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository, DestinationRepository destinationRepository) {

        return args -> {

            if (roleRepository.findByRoleName("Traveler").isEmpty()) {
                roleRepository.save(new Role(null, "Traveler", null));
            }

            if (roleRepository.findByRoleName("Group Admin").isEmpty()) {
                roleRepository.save(new Role(null, "Group Admin", null));
            }

            if (roleRepository.findByRoleName("Administrator").isEmpty()) {
                roleRepository.save(new Role(null, "Administrator", null));
            }

            if (destinationRepository.count() == 0) {
                destinationRepository.save(destination("Munnar","Kerala","Munnar","Tea gardens, misty hills and scenic hiking trails.","Explore tea estates and sunrise viewpoints.","Tea Museum; Eravikulam National Park; Mattupetty Dam",95,10.0889,77.0595,"https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=800&q=80"));
                destinationRepository.save(destination("Jaipur","Rajasthan","Jaipur","Historic forts, colourful markets and royal architecture.","Start forts early, then reserve an evening for local markets.","Amber Fort; City Palace; Hawa Mahal",92,26.9124,75.7873,"https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80"));
                destinationRepository.save(destination("Goa","Goa","Panaji","Beaches, heritage quarters and relaxed coastal experiences.","Mix beach time with Old Goa heritage walks and coastal cuisine.","Baga Beach; Basilica of Bom Jesus; Fontainhas",98,15.4909,73.8278,"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"));
            }

        };
    }

    private Destination destination(String name,String state,String city,String description,String guide,String attractions,int popularity,double latitude,double longitude,String image){Destination d=new Destination();d.setName(name);d.setCountry("India");d.setState(state);d.setCity(city);d.setDescription(description);d.setTravelGuide(guide);d.setAttractions(attractions);d.setPopularityScore(popularity);d.setLatitude(latitude);d.setLongitude(longitude);d.setImageUrl(image);return d;}
}
