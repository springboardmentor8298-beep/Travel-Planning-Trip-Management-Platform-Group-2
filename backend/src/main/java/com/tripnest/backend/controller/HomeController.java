package com.tripnest.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<?> home() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "application", "TripNest Backend API",
                "version", "1.0.0",
                "message", "TripNest Spring Boot backend server is running successfully!",
                "frontendUrl", "http://localhost:5173"
        ));
    }
}
