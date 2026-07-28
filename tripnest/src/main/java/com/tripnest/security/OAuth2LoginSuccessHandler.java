package com.tripnest.security;

import com.tripnest.entity.User;
import com.tripnest.service.UserService;
import com.tripnest.service.AuthService;
import com.tripnest.dto.AuthResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final AuthService authService;

    public OAuth2LoginSuccessHandler(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        if (email == null || email.isBlank()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "OAuth2 email not found");
            return;
        }

        User user = userService.findOrCreateOAuthUser(email, name != null ? name : email);
        AuthResponse tokens = authService.issueTokens(user);
        String redirectUrl = UriComponentsBuilder
                .fromUriString("http://localhost:5173/login")
                .queryParam("token", tokens.getToken())
                .queryParam("refreshToken", tokens.getRefreshToken())
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
