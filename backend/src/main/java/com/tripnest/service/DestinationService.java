package com.tripnest.service;

import com.tripnest.dto.DestinationRequest;
import com.tripnest.dto.DestinationResponse;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.Destination;
import com.tripnest.repository.DestinationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DestinationService {

    private final DestinationRepository repo;

    public DestinationService(DestinationRepository repo) {
        this.repo = repo;
    }

    /* ── List / search ── */
    @Transactional(readOnly = true)
    public List<DestinationResponse> getAll(String country, String type, String q) {
        List<Destination> results;
        if (q != null && !q.isBlank()) {
            results = repo.search(q.trim());
        } else if (country != null && !country.isBlank()) {
            results = repo.findByCountryIgnoreCaseOrderByNameAsc(country.trim());
        } else if (type != null && !type.isBlank()) {
            results = repo.findByTypeIgnoreCaseOrderByNameAsc(type.trim());
        } else {
            results = repo.findAllByOrderByCreatedAtDesc();
        }
        return results.stream().map(DestinationResponse::fromEntity).collect(Collectors.toList());
    }

    /* ── Get by id ── */
    @Transactional(readOnly = true)
    public DestinationResponse getById(Long id) {
        return DestinationResponse.fromEntity(
            repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Destination not found")));
    }

    /* ── Create ── */
    public DestinationResponse create(DestinationRequest req) {
        Destination d = new Destination();
        applyRequest(d, req);
        return DestinationResponse.fromEntity(repo.save(d));
    }

    /* ── Update ── */
    public DestinationResponse update(Long id, DestinationRequest req) {
        Destination d = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));
        applyRequest(d, req);
        return DestinationResponse.fromEntity(repo.save(d));
    }

    /* ── Delete ── */
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Destination not found");
        repo.deleteById(id);
    }

    private void applyRequest(Destination d, DestinationRequest req) {
        d.setName(req.getName().trim());
        d.setCountry(req.getCountry().trim());
        d.setDescription(req.getDescription());
        d.setImageUrl(req.getImageUrl());
        d.setStartingPrice(req.getStartingPrice());
        d.setDurationDays(req.getDurationDays());
        d.setDurationNights(req.getDurationNights());
        d.setTravelGuideUrl(req.getTravelGuideUrl());
        d.setType(req.getType());
        d.setLatitude(req.getLatitude());
        d.setLongitude(req.getLongitude());
    }
}
