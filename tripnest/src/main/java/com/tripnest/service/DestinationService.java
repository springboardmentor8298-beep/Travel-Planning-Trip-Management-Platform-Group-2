package com.tripnest.service;

import com.tripnest.dto.DestinationResponse;
import com.tripnest.entity.Destination;
import com.tripnest.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for browsing and searching destinations.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public List<DestinationResponse> getAllDestinations() {
        return destinationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<DestinationResponse> searchDestinations(String query) {
        return destinationRepository
                .findByNameContainingIgnoreCaseOrCountryContainingIgnoreCase(query, query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DestinationResponse getById(Long id) {
        Destination dest = destinationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destination not found"));
        return toResponse(dest);
    }

    private DestinationResponse toResponse(Destination dest) {
        DestinationResponse res = new DestinationResponse();
        res.setId(dest.getId());
        res.setName(dest.getName());
        res.setCountry(dest.getCountry());
        res.setDescription(dest.getDescription());
        res.setClimate(dest.getClimate());
        res.setBestTimeToVisit(dest.getBestTimeToVisit());
        res.setPopularAttractions(dest.getPopularAttractions());
        return res;
    }
}
