package com.tripnest.security;

import com.tripnest.entity.Role;
import com.tripnest.entity.User;
import com.tripnest.entity.enums.AuthProvider;
import com.tripnest.entity.enums.RoleName;
import com.tripnest.repository.RoleRepository;
import com.tripnest.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;

/**
 * Fires after Google verifies the user. We either link/create a local User
 * record, then redirect back to the SPA with a short-lived access token
 * in the query string so the frontend can pick it up and store it.
 */
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;

    @Value("${tripnest.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getName();

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(name != null ? name : email);
            newUser.setProfilePictureUrl(picture);
            newUser.setProvider(AuthProvider.GOOGLE);
            newUser.setProviderId(googleId);
            newUser.setEmailVerified(true);
            Role travelerRole = roleRepository.findByName(RoleName.ROLE_TRAVELER)
                    .orElseThrow(() -> new IllegalStateException("Default role not seeded"));
            newUser.setRoles(Set.of(travelerRole));
            return userRepository.save(newUser);
        });

        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtUtil.generateAccessToken(principal);

        String targetUrl = redirectUri + "?token=" + accessToken;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
