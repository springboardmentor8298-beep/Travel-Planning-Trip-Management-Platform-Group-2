package com.tripnest.service;

import com.tripnest.dto.DestinationRequest;
import com.tripnest.dto.DestinationResponse;
import com.tripnest.entity.Destination;
import com.tripnest.repository.DestinationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DestinationService {
    private final DestinationRepository destinationRepository;

    public DestinationService(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    public DestinationResponse createDestination(DestinationRequest request) {
        Destination destination = new Destination();
        destination.setName(request.getName());
        destination.setCountry(request.getCountry());
        destination.setCity(request.getCity());
        destination.setDescription(request.getDescription());
        destination.setPhotoUrl(request.getPhotoUrl());
        destination.setLatitude(request.getLatitude());
        destination.setLongitude(request.getLongitude());
        destination.setBestTimeToVisit(request.getBestTimeToVisit());
        destination.setCurrency(request.getCurrency());
        destination.setLanguage(request.getLanguage());
        destination = destinationRepository.save(destination);
        return toDestinationResponse(destination);
    }

    public List<DestinationResponse> getAllDestinations() {
        return destinationRepository.findAll().stream()
                .map(this::toDestinationResponse)
                .collect(Collectors.toList());
    }

    public DestinationResponse getDestinationById(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
        return toDestinationResponse(destination);
    }

    public List<DestinationResponse> searchDestinations(String query) {
        return destinationRepository.findByNameContainingIgnoreCase(query).stream()
                .map(this::toDestinationResponse)
                .collect(Collectors.toList());
    }

    public DestinationResponse updateDestination(Long id, DestinationRequest request) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
        destination.setName(request.getName());
        destination.setCountry(request.getCountry());
        destination.setCity(request.getCity());
        destination.setDescription(request.getDescription());
        destination.setPhotoUrl(request.getPhotoUrl());
        destination.setLatitude(request.getLatitude());
        destination.setLongitude(request.getLongitude());
        destination.setBestTimeToVisit(request.getBestTimeToVisit());
        destination.setCurrency(request.getCurrency());
        destination.setLanguage(request.getLanguage());
        destination = destinationRepository.save(destination);
        return toDestinationResponse(destination);
    }

    public void deleteDestination(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
        destinationRepository.delete(destination);
    }

    private DestinationResponse toDestinationResponse(Destination destination) {
        DestinationResponse response = new DestinationResponse();
        response.setId(destination.getId());
        response.setName(destination.getName());
        response.setCountry(destination.getCountry());
        response.setCity(destination.getCity());
        response.setLocation(destination.getLocation());
        response.setDescription(destination.getDescription());
        response.setPhotoUrl(destination.getPhotoUrl());
        response.setLatitude(destination.getLatitude());
        response.setLongitude(destination.getLongitude());
        response.setBestTimeToVisit(destination.getBestTimeToVisit());
        response.setCurrency(destination.getCurrency());
        response.setLanguage(destination.getLanguage());
        response.setCreatedAt(destination.getCreatedAt());
        response.setUpdatedAt(destination.getUpdatedAt());
        return response;
    }
}
