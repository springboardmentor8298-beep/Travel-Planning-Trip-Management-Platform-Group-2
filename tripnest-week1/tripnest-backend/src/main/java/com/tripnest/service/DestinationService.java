package com.tripnest.service;

import com.tripnest.dto.DestinationRequest;
import com.tripnest.dto.DestinationResponse;
import com.tripnest.entity.Destination;
import com.tripnest.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public List<DestinationResponse> getAllDestinations() {
        return destinationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public DestinationResponse getDestination(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Destination not found"));
        return toResponse(destination);
    }

    public DestinationResponse createDestination(DestinationRequest request) {
        Destination destination = Destination.builder()
                .name(request.getName())
                .country(request.getCountry())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .popularAttractions(request.getPopularAttractions())
                .build();
        destinationRepository.save(destination);
        return toResponse(destination);
    }

    private DestinationResponse toResponse(Destination d) {
        return new DestinationResponse(
                d.getId(), d.getName(), d.getCountry(), d.getDescription(),
                d.getImageUrl(), d.getPopularAttractions()
        );
    }
}
