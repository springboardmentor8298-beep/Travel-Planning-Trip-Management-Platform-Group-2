package com.tripnest.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

    	String authHeader = request.getHeader("Authorization");
    	System.out.println("Authorization Header = " + authHeader);

    	if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    	    System.out.println("No Bearer Token");
    	    filterChain.doFilter(request, response);
    	    return;
    	}

        String token = authHeader.substring(7);
        System.out.println("Token = " + token);
        
        String email = jwtService.extractUsername(token);
        System.out.println("Email = " + email);

        if (email != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(email);
            System.out.println("Loaded User = " + userDetails.getUsername());
            
            boolean valid = jwtService.isTokenValid(token, userDetails.getUsername());
            System.out.println("Token Valid = " + valid);

            if (jwtService.isTokenValid(token, userDetails.getUsername())) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);

    }
}