package com.tripnest.security;

import com.tripnest.model.Role;
import com.tripnest.model.User;
import com.tripnest.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final String successRedirectUrl;

    public GoogleOAuth2SuccessHandler(UserRepository userRepository, JwtUtil jwtUtil,
                                      @Value("${app.oauth2.success-redirect}") String successRedirectUrl) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.successRedirectUrl = successRedirectUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oauth2User.getAttributes();

        String email = (String) attributes.get("email");
        String fullName = (String) attributes.get("name");

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Google did not return an email address");
            return;
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> registerGoogleUser(email, fullName));

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        response.sendRedirect(successRedirectUrl + "?token=" + token);
    }

    private User registerGoogleUser(String email, String fullName) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName != null ? fullName : email);
        user.setPassword("GOOGLE_OAUTH");
        user.setRole(Role.TRAVELER);
        return userRepository.save(user);
    }
}
