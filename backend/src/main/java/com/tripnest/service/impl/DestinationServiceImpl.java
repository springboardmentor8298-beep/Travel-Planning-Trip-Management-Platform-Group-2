package com.tripnest.service.impl;

import com.tripnest.dto.destination.DestinationRequest;
import com.tripnest.dto.destination.DestinationResponse;
import com.tripnest.entity.Destination;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DestinationServiceImpl implements DestinationService {

    private final DestinationRepository destinationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<DestinationResponse> search(String search, String country, Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        String normalizedCountry = (country == null || country.isBlank()) ? null : country.trim();
        return destinationRepository.search(normalizedSearch, normalizedCountry, pageable)
                .map(DestinationResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public DestinationResponse getById(Long id) {
        return DestinationResponse.fromEntity(findEntity(id));
    }

    @Override
    @Transactional
    public DestinationResponse create(DestinationRequest request) {
        Destination destination = new Destination();
        applyRequest(destination, request);
        return DestinationResponse.fromEntity(destinationRepository.save(destination));
    }

    @Override
    @Transactional
    public DestinationResponse update(Long id, DestinationRequest request) {
        Destination destination = findEntity(id);
        applyRequest(destination, request);
        return DestinationResponse.fromEntity(destinationRepository.save(destination));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Destination destination = findEntity(id);
        destinationRepository.delete(destination);
    }

    private Destination findEntity(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));
    }

    private void applyRequest(Destination destination, DestinationRequest request) {
        destination.setName(request.getName());
        destination.setCountry(request.getCountry());
        destination.setCity(request.getCity());
        destination.setDescription(request.getDescription());
        destination.setLatitude(request.getLatitude());
        destination.setLongitude(request.getLongitude());
        destination.setCoverImageUrl(request.getCoverImageUrl());
    }
}
