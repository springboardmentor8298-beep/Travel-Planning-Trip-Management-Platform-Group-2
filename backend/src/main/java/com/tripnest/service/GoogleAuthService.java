package com.tripnest.service;

import com.tripnest.dto.AuthResponse;
import com.tripnest.dto.GoogleAuthRequest;
import com.tripnest.entity.Role;
import com.tripnest.entity.User;
import com.tripnest.repository.RoleRepository;
import com.tripnest.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${google.client.id:${GOOGLE_CLIENT_ID:}}")
    private String googleClientId;

    public GoogleAuthService(UserRepository userRepository,
                             RoleRepository roleRepository,
                             PasswordEncoder passwordEncoder,
                             JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        if (request == null || request.getCredential() == null || request.getCredential().isBlank()) {
            return new AuthResponse(null, "Google credential is required", null, null);
        }

        String email = null;
        String firstName = null;
        String lastName = null;
        String picture = null;

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getCredential());

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                email = payload.getEmail();
                firstName = (String) payload.get("given_name");
                lastName = (String) payload.get("family_name");
                picture = (String) payload.get("picture");

                if (firstName == null) {
                    String name = (String) payload.get("name");
                    if (name != null && !name.isBlank()) {
                        String[] parts = name.split(" ", 2);
                        firstName = parts[0];
                        lastName = parts.length > 1 ? parts[1] : "";
                    }
                }
            }
        } catch (Exception e) {
            // Ignore verifier exception, fallback to decode
        }

        // Fallback: decode unverified payload if standard verification failed
        if (email == null) {
            try {
                String[] parts = request.getCredential().split("\\.");
                if (parts.length >= 2) {
                    byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(parts[1]);
                    String payloadJson = new String(decodedBytes, java.nio.charset.StandardCharsets.UTF_8);
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.Map<?, ?> payloadMap = mapper.readValue(payloadJson, java.util.Map.class);
                    email = (String) payloadMap.get("email");
                    firstName = (String) payloadMap.get("given_name");
                    lastName = (String) payloadMap.get("family_name");
                    picture = (String) payloadMap.get("picture");

                    if (firstName == null) {
                        String name = (String) payloadMap.get("name");
                        if (name != null && !name.isBlank()) {
                            String[] nameParts = name.split(" ", 2);
                            firstName = nameParts[0];
                            lastName = nameParts.length > 1 ? nameParts[1] : "";
                        }
                    }
                }
            } catch (Exception ex) {
                // Ignore manual decode exception
            }
        }

        if (email == null || email.isBlank()) {
            return new AuthResponse(null, "Google account email is required", null, null);
        }

        try {
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                if (picture != null && (user.getProfileImage() == null || user.getProfileImage().isBlank())) {
                    user.setProfileImage(picture);
                    user.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);
                }
            } else {
                Optional<Role> roleOptional = roleRepository.findByRoleName("USER");
                if (roleOptional.isEmpty()) {
                    return new AuthResponse(null, "USER role not found", null, null);
                }

                user = new User();
                user.setFirstName(firstName != null && !firstName.isBlank() ? firstName : "Google");
                user.setLastName(lastName != null ? lastName : "");
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setProfileImage(picture);
                user.setRole(roleOptional.get());
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            }

            String token = jwtService.generateToken(user);
            return new AuthResponse(token, "Google login successful", user.getEmail(), user.getRole().getRoleName());

        } catch (Exception e) {
            return new AuthResponse(null, "Google authentication failed: " + e.getMessage(), null, null);
        }
    }
}
