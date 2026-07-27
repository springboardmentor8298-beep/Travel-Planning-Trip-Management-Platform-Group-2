package com.tripnest.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private final JwtProperties jwtProperties;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());
    }

    public String generateAccessToken(UserPrincipal principal) {
        List<String> roles = principal.getAuthorities().stream()
                .map(Object::toString)
                .collect(Collectors.toList());

        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getAccessTokenExpirationMs());

        return Jwts.builder()
                .issuer(jwtProperties.getIssuer())
                .subject(principal.getUsername())
                .claim("uid", principal.getId())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey())
                .compact();
    }

    public String generateRefreshTokenValue() {
        // Opaque random value; persisted server-side in RefreshToken table.
        return java.util.UUID.randomUUID().toString() + java.util.UUID.randomUUID();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired: {}", e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT: {}", e.getMessage());
        }
        return false;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
