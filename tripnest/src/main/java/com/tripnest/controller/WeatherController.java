package com.tripnest.controller;

import com.tripnest.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class WeatherController {

    private final WeatherService weatherService;

    @PostMapping("/{destinationId}/weather")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> updateDestinationWeather(@PathVariable Long destinationId) {
        weatherService.updateDestinationWeather(destinationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/weather/update-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAllDestinationsWeather() {
        weatherService.updateAllDestinationsWeather();
        return ResponseEntity.ok().build();
    }
}
