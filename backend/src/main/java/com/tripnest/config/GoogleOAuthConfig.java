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
        return value != null && !value.isBlank()
                && !value.trim().equalsIgnoreCase("YOUR_GOOGLE_CLIENT_ID")
                && !value.trim().equalsIgnoreCase("YOUR_GOOGLE_CLIENT_SECRET")
                && !value.trim().equalsIgnoreCase("your-real-client-id")
                && !value.trim().equalsIgnoreCase("your-real-client-secret");
    }
}
