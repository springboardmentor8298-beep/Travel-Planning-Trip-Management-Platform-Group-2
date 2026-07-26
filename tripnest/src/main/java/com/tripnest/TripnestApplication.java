package com.tripnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import com.tripnest.entity.ERole;
import com.tripnest.entity.Role;
import com.tripnest.repository.RoleRepository;

@SpringBootApplication
public class TripnestApplication {

    public static void main(String[] args) {
        SpringApplication.run(TripnestApplication.class, args);
    }

    @Bean
    @Order(1)
    CommandLineRunner init(RoleRepository roleRepository) {
        return args -> {
            for (ERole roleName : ERole.values()) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                }
            }
        };
    }
}
