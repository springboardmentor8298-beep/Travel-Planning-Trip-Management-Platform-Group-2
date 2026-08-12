package com.tripnest.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.tripnest.security.CustomUserDetailsService;
import com.tripnest.security.GoogleOAuth2SuccessHandler;
import com.tripnest.security.JwtAuthFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // enables @PreAuthorize for role-based access
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;
    private final GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;
    private final GoogleOAuthConfig googleOAuthConfig;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtAuthFilter jwtAuthFilter,
                          GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler,
                          GoogleOAuthConfig googleOAuthConfig) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
        this.googleOAuth2SuccessHandler = googleOAuth2SuccessHandler;
        this.googleOAuthConfig = googleOAuthConfig;
    }

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers("/login/oauth2/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/api/trips/**").authenticated()
                .requestMatchers("/api/groups/**").authenticated()
                .requestMatchers("/api/destinations/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider());

        // Always configure oauth2Login so Spring's built-in filter chain is
        // properly set up — without it, any OAuth2 callback lands on the raw
        // Spring error page. When credentials are missing the failure handler
        // redirects back to the React frontend gracefully.
        http.oauth2Login(oauth2 -> oauth2
            .authorizationEndpoint(auth ->
                auth.baseUri("/oauth2/authorization"))
            .redirectionEndpoint(redir ->
                redir.baseUri("/login/oauth2/code/*"))
            .successHandler(googleOAuth2SuccessHandler)
            .failureHandler((request, response, exception) -> {
                // Redirect to React frontend with a readable error message
                String msg = "Google sign-in is not configured on this server.";
                if (googleOAuthConfig.enabled()) {
                    msg = "Google sign-in failed: " + getRootCauseMessage(exception);
                    if (msg.endsWith(": ") || msg.endsWith(":")) {
                        msg = "Google sign-in failed: authorization error. Check client ID/secret and redirect URI.";
                    }
                }
                response.sendRedirect(frontendUrl
                    + "/oauth2/redirect?error="
                    + java.net.URLEncoder.encode(msg, "UTF-8"));
            })
        );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static String getRootCauseMessage(Throwable throwable) {
        Throwable root = throwable;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        String message = root.getMessage();
        String name = root.getClass().getSimpleName();
        if (message == null || message.isBlank()) {
            return name;
        }
        return name + ": " + message;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
