package com.tripnest.service;

import com.tripnest.entity.Destination;
import com.tripnest.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class WeatherService {

    private final DestinationRepository destinationRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String WEATHER_API_URL = "http://api.weatherapi.com/v1/current.json";
    private static final String API_KEY = "YOUR_API_KEY"; // Replace with actual API key

    public void updateDestinationWeather(Long destinationId) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        try {
            String url = String.format("%s?key=%s&q=%s", WEATHER_API_URL, API_KEY, destination.getName());
            WeatherResponse response = restTemplate.getForObject(url, WeatherResponse.class);

            if (response != null && response.getCurrent() != null) {
                destination.setCurrentWeather(response.getCurrent().getCondition().getText());
                destination.setTemperature(response.getCurrent().getTempC() + "°C");
                destination.setWeatherUpdatedAt(LocalDateTime.now());
                destinationRepository.save(destination);
            }
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to fetch weather data: " + e.getMessage());
        }
    }

    public void updateAllDestinationsWeather() {
        destinationRepository.findAll().forEach(destination -> {
            try {
                updateDestinationWeather(destination.getId());
            } catch (Exception e) {
                System.err.println("Failed to update weather for destination " + destination.getId());
            }
        });
    }

    // Inner classes for API response mapping
    private static class WeatherResponse {
        private Current current;

        public Current getCurrent() {
            return current;
        }
    }

    private static class Current {
        private double tempC;
        private Condition condition;

        public double getTempC() {
            return tempC;
        }

        public Condition getCondition() {
            return condition;
        }
    }

    private static class Condition {
        private String text;

        public String getText() {
            return text;
        }
    }
}
