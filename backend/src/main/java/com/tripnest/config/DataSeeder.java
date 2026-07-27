package com.tripnest.config;

import com.tripnest.entity.Role;
import com.tripnest.entity.enums.RoleName;
import com.tripnest.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Ensures the three platform roles exist on startup so registration
 * and OAuth2 sign-in can always attach a default ROLE_TRAVELER.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName).orElseGet(() -> {
                Role role = new Role();
                role.setName(roleName);
                return roleRepository.save(role);
            });
        }
    }
}
