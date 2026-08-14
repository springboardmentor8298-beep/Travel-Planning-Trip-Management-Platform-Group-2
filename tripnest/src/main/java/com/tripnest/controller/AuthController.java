package com.tripnest.controller;
import com.tripnest.dto.*;
import com.tripnest.entity.ERole;
import com.tripnest.entity.Role;
import com.tripnest.entity.User;
import com.tripnest.repository.RoleRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.security.jwt.JwtUtils;
import com.tripnest.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * REST controller for authentication endpoints.
 * <p>
 * Public endpoints (no auth required):
 *   POST /api/auth/signin   — Login and receive JWT
 *   POST /api/auth/signup   — Register a new user
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    /**
     * Sign in — authenticates user and returns a JWT token.
     */
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                userDetails.getPhone(),
                roles));
    }

    /**
     * Sign up — registers a new user with the specified role.
     * Default role is ROLE_TRAVELER if none specified.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user account
        User user = new User(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setPhone(signUpRequest.getPhone());

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role travelerRole = roleRepository.findByName(ERole.ROLE_TRAVELER)
                    .orElseThrow(() -> new RuntimeException(
                            "Error: Role TRAVELER not found. Please seed roles table."));
            roles.add(travelerRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin" -> {
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role ADMIN not found."));
                        roles.add(adminRole);
                    }
                    case "agent" -> {
                        Role agentRole = roleRepository.findByName(ERole.ROLE_AGENT)
                                .orElseThrow(() -> new RuntimeException("Error: Role AGENT not found."));
                        roles.add(agentRole);
                    }
                    default -> {
                        Role travelerRole = roleRepository.findByName(ERole.ROLE_TRAVELER)
                                .orElseThrow(() -> new RuntimeException("Error: Role TRAVELER not found."));
                        roles.add(travelerRole);
                    }
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    private final com.tripnest.repository.PasswordResetTokenRepository passwordResetTokenRepository;

    /**
     * Forgot Password — generates a 15-minute reset token.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "No account registered with this email"));

        // Remove previous tokens for this user
        passwordResetTokenRepository.findByUser(user)
                .ifPresent(passwordResetTokenRepository::delete);

        String token = java.util.UUID.randomUUID().toString();
        com.tripnest.entity.PasswordResetToken resetToken = new com.tripnest.entity.PasswordResetToken(
                token, user, java.time.LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(resetToken);

        // Return token in response (and log simulated email dispatch)
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Password reset instructions sent to " + request.getEmail(),
                "resetToken", token
        ));
    }

    /**
     * Reset Password — updates user password using validated reset token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        com.tripnest.entity.PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully. You can now login."));
    }

    /**
     * OAuth2 Social Sign-In — Google Login integration.
     */
    @PostMapping("/oauth2/google")
    public ResponseEntity<?> oauth2GoogleLogin(@Valid @RequestBody OAuth2LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    String baseUsername = request.getEmail().split("@")[0];
                    String username = baseUsername;
                    int suffix = 1;
                    while (userRepository.existsByUsername(username)) {
                        username = baseUsername + suffix++;
                    }

                    User newUser = new User(username, request.getEmail(), encoder.encode(java.util.UUID.randomUUID().toString()));
                    String[] names = request.getName().split(" ", 2);
                    newUser.setFirstName(names[0]);
                    if (names.length > 1) newUser.setLastName(names[1]);
                    if (request.getAvatarUrl() != null) newUser.setAvatarUrl(request.getAvatarUrl());

                    Role travelerRole = roleRepository.findByName(ERole.ROLE_TRAVELER)
                            .orElseThrow(() -> new RuntimeException("Error: Role TRAVELER not found."));
                    newUser.setRoles(Set.of(travelerRole));
                    return userRepository.save(newUser);
                });

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                roles
        ));
    }
}
