package com.tripnest.backend.service;

import com.tripnest.backend.dto.DestinationResponse;
import java.util.List;

public interface DestinationService {
    List<DestinationResponse> getDestinations(String country, String state);
}
