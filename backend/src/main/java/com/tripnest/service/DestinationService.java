package com.tripnest.service;

import com.tripnest.dto.destination.DestinationRequest;
import com.tripnest.dto.destination.DestinationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DestinationService {

    Page<DestinationResponse> search(String search, String country, Pageable pageable);

    DestinationResponse getById(Long id);

    DestinationResponse create(DestinationRequest request);

    DestinationResponse update(Long id, DestinationRequest request);

    void delete(Long id);
}
