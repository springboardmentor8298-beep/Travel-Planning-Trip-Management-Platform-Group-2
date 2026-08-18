package com.tripnest.service;

import com.tripnest.dto.DestinationRequest;
import com.tripnest.dto.DestinationResponse;
import com.tripnest.entity.Destination;
import com.tripnest.repository.DestinationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DestinationService {

    @Autowired
    private DestinationRepository destinationRepository;

    public DestinationResponse createDestination(DestinationRequest request) {

        Destination destination = new Destination();

        destination.setName(request.getName());
        destination.setDescription(request.getDescription());
        destination.setLocation(request.getLocation());
        destination.setCity(request.getCity());
        destination.setCountry(request.getCountry());
        destination.setImageUrl(request.getImageUrl());
        destination.setAverageCost(request.getAverageCost());
        destination.setBestTimeToVisit(request.getBestTimeToVisit());
        destination.setClimate(request.getClimate());

        if (request.getPopular() != null) {
            destination.setPopular(request.getPopular());
        }

        Destination saved = destinationRepository.save(destination);

        return mapToResponse(saved);
    }

    public List<DestinationResponse> getAllDestinations() {

        return destinationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DestinationResponse> searchDestinations(String name) {

        return destinationRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DestinationResponse getDestinationById(Long id) {

        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        return mapToResponse(destination);
    }

    public void deleteDestination(Long id) {

        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        destinationRepository.delete(destination);
    }

    private DestinationResponse mapToResponse(Destination destination) {

        DestinationResponse response = new DestinationResponse();

        response.setId(destination.getId());
        response.setName(destination.getName());
        response.setDescription(destination.getDescription());
        response.setLocation(destination.getLocation());
        response.setCity(destination.getCity());
        response.setCountry(destination.getCountry());
        response.setImageUrl(destination.getImageUrl());
        response.setAverageCost(destination.getAverageCost());
        response.setBestTimeToVisit(destination.getBestTimeToVisit());
        response.setClimate(destination.getClimate());
        response.setPopular(destination.getPopular());
        response.setCreatedAt(destination.getCreatedAt());
        response.setUpdatedAt(destination.getUpdatedAt());

        return response;
    }
}