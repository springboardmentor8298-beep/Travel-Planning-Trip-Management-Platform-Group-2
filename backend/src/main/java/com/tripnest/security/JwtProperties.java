package com.tripnest.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "tripnest.jwt")
public class JwtProperties {

    /** Base64-encoded HMAC secret, must be >= 256 bits for HS256. */
    private String secret;

    /** Access token lifetime in milliseconds. */
    private long accessTokenExpirationMs = 15 * 60 * 1000L; // 15 minutes

    /** Refresh token lifetime in milliseconds. */
    private long refreshTokenExpirationMs = 7 * 24 * 60 * 60 * 1000L; // 7 days

    private String issuer = "tripnest";
}
