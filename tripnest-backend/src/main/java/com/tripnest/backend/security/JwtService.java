package com.tripnest.backend.security;

import io.jsonwebtoken.Jwts;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;

import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;

import io.jsonwebtoken.Claims;


@Service
public class JwtService {

        private final String SECRET_KEY = "tripnest_secret_key_123456789_secure_project_key";


        private Key getSignKey() {
                return Keys.hmacShaKeyFor(
                        SECRET_KEY.getBytes(StandardCharsets.UTF_8)
                );
        }

        private Claims extractAllClaims(String token){
                return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        }

        public String generateToken(String email){


                return Jwts.builder()
                        .setSubject(email)
                        .setIssuedAt(new Date())
                        .setExpiration(
                        new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)
                )
                .signWith(getSignKey())
                .compact();

        }

        public String extractEmail(String token) {

                return extractAllClaims(token).getSubject();

        }

        public Date extractExpiration(String token) {
                return extractAllClaims(token).getExpiration();
        }

        private boolean isTokenExpired(String token) {

                return extractExpiration(token).before(new Date());

        }

        public boolean isTokenValid(String token, UserDetails userDetails) {
                final String email = extractEmail(token);
                return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
        }

}