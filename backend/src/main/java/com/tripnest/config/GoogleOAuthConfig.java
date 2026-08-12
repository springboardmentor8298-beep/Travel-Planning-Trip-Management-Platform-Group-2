package com.tripnest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GoogleOAuthConfig {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String clientSecret;

    public boolean enabled() {
        return isValid(clientId) && isValid(clientSecret);
    }

    public String getClientId() {
        return clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    private boolean isValid(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String trimmed = value.trim();
        return !trimmed.equalsIgnoreCase("YOUR_GOOGLE_CLIENT_ID")
                && !trimmed.equalsIgnoreCase("YOUR_GOOGLE_CLIENT_SECRET")
                && !trimmed.equalsIgnoreCase("your-real-client-id")
                && !trimmed.equalsIgnoreCase("your-real-client-secret")
                && !trimmed.toUpperCase().contains("YOUR_")
                && !trimmed.startsWith("<YOUR_")
                && !trimmed.contains("***")
                && !trimmed.contains("<")
                && !trimmed.contains(">");
    }
}
