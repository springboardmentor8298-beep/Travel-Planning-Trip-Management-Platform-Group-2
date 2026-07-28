package com.tripnest.service;

import com.tripnest.entity.Role;
import com.tripnest.entity.User;
import com.tripnest.repository.RoleRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role travelerRole = roleRepository.findByRoleName("Traveler")
                .orElseThrow(() -> new RuntimeException("Traveler role not found"));

        user.setRole(travelerRole);

        // Password is already encoded in AuthService
        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    public Optional<User> findByEmailOptional(String email) { return userRepository.findByEmail(email); }

    public User findOrCreateOAuthUser(String email, String fullName) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    Role travelerRole = roleRepository.findByRoleName("Traveler")
                            .orElseThrow(() -> new RuntimeException("Traveler role not found"));

                    User user = new User();
                    user.setFullName(fullName);
                    user.setEmail(email);
                    user.setPhoneNumber("OAuth2");
                    user.setPassword(passwordEncoder.encode("OAUTH2_USER"));
                    user.setRole(travelerRole);

                    return userRepository.save(user);
                });
    }
}
