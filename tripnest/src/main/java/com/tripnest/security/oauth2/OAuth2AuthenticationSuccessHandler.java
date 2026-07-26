package com.tripnest.security.oauth2;

import com.tripnest.entity.ERole;
import com.tripnest.entity.Role;
import com.tripnest.entity.User;
import com.tripnest.repository.RoleRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.security.jwt.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Handles a successful Google OAuth2 login.
 * <p>
 * Flow:
 *   1. Extract email/name from the OAuth2User attributes.
 *   2. Find or create the TripNest User record.
 *   3. Generate a JWT token.
 *   4. Redirect the browser to the React app with the token as a query param.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final String FRONTEND_REDIRECT_URL = "http://localhost:3000/oauth2/callback";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email     = oauth2User.getAttribute("email");
        String firstName = oauth2User.getAttribute("given_name");
        String lastName  = oauth2User.getAttribute("family_name");
        String picture   = oauth2User.getAttribute("picture");

        if (email == null) {
            log.error("OAuth2 login failed: email attribute missing from Google response");
            response.sendRedirect("http://localhost:3000/login?error=oauth2_no_email");
            return;
        }

        // ── Find or create user ────────────────────────────────────────────────
        User user;
        Optional<User> existing = userRepository.findByEmail(email);

        if (existing.isPresent()) {
            user = existing.get();
            // Keep profile info fresh
            if (firstName != null) user.setFirstName(firstName);
            if (lastName  != null) user.setLastName(lastName);
            if (picture   != null && user.getAvatarUrl() == null) user.setAvatarUrl(picture);
            userRepository.save(user);
        } else {
            user = new User();
            user.setEmail(email);
            user.setUsername(uniqueUsername(email));
            user.setFirstName(firstName != null ? firstName : email.split("@")[0]);
            user.setLastName(lastName != null ? lastName : "");
            user.setPassword("{oauth2}"); // placeholder — OAuth2 users never use password login
            if (picture != null) user.setAvatarUrl(picture);

            Set<Role> roles = new HashSet<>();
            Role travelerRole = roleRepository.findByName(ERole.ROLE_TRAVELER)
                    .orElseThrow(() -> new RuntimeException("ROLE_TRAVELER not found"));
            roles.add(travelerRole);
            user.setRoles(roles);

            userRepository.save(user);
            log.info("Created new OAuth2 user: {}", user.getUsername());
        }

        // ── Issue JWT and redirect to React app ────────────────────────────────
        String token     = jwtUtils.generateJwtToken(user.getUsername());
        String roles     = user.getRoles().stream()
                               .map(r -> r.getName().name())
                               .reduce("", (a, b) -> a.isEmpty() ? b : a + "," + b);

        String redirectUrl = FRONTEND_REDIRECT_URL
                + "?token="     + encode(token)
                + "&id="        + user.getId()
                + "&username="  + encode(user.getUsername())
                + "&email="     + encode(user.getEmail())
                + "&firstName=" + encode(user.getFirstName() != null ? user.getFirstName() : "")
                + "&lastName="  + encode(user.getLastName()  != null ? user.getLastName()  : "")
                + "&roles="     + encode(roles)
                + "&avatarUrl=" + encode(user.getAvatarUrl() != null ? user.getAvatarUrl() : "");

        response.sendRedirect(redirectUrl);
    }

    /**
     * Generate a unique username based on the email prefix.
     * Appends a short random suffix if the email prefix is already taken.
     */
    private String uniqueUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
        // Truncate to leave room for suffix within the 20-char limit
        if (base.length() > 20) base = base.substring(0, 20);

        if (!userRepository.existsByUsername(base)) {
            return base;
        }

        // Try with a 4-char suffix
        String suffix   = UUID.randomUUID().toString().replace("-", "").substring(0, 4);
        int    maxBase  = 20 - 1 - suffix.length(); // e.g. 15
        String trimmed  = base.length() > maxBase ? base.substring(0, maxBase) : base;
        return trimmed + "_" + suffix;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
