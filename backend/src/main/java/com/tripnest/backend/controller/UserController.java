package com.tripnest.backend.controller;

import com.tripnest.backend.model.UserEntity;
import com.tripnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private String getAuthenticatedEmail(String requestedEmail) {
        if (requestedEmail != null && !requestedEmail.isBlank() && !requestedEmail.equals("null")) {
            return requestedEmail.trim();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            return auth.getName();
        }
        return "traveler_default@gmail.com";
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam(required = false) String email) {
        String queryEmail = getAuthenticatedEmail(email);
        Optional<UserEntity> userOpt = userRepository.findByEmail(queryEmail);
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        }

        // Create a new, unique user profile for this fresh email
        String defaultName = queryEmail.contains("@") ? queryEmail.split("@")[0] : queryEmail;
        UserEntity newUser = new UserEntity(
                "user_" + UUID.randomUUID().toString().substring(0, 8),
                defaultName,
                queryEmail,
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                "A-" + (10000000 + new Random().nextInt(90000000)),
                "INR",
                "Avid Explorer & World Traveler",
                "GOOGLE",
                "ROLE_TRAVELER"
        );
        UserEntity saved = userRepository.save(newUser);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        String email = getAuthenticatedEmail(body.get("email"));
        UserEntity user = userRepository.findByEmail(email).orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setId("user_" + UUID.randomUUID().toString().substring(0, 8));
            u.setEmail(email);
            return u;
        });

        if (body.containsKey("fullName") && body.get("fullName") != null && !body.get("fullName").isBlank()) {
            user.setName(body.get("fullName"));
        } else if (body.containsKey("name") && body.get("name") != null && !body.get("name").isBlank()) {
            user.setName(body.get("name"));
        }
        if (body.containsKey("bio")) user.setBio(body.get("bio"));
        if (body.containsKey("role")) user.setRole(body.get("role"));
        if (body.containsKey("currencyPreference")) user.setCurrencyPreference(body.get("currencyPreference"));
        if (body.containsKey("passportNumber")) user.setPassportNumber(body.get("passportNumber"));

        UserEntity saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }
}
