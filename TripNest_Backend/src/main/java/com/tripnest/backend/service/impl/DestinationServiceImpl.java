package com.tripnest.backend.service.impl;

import com.tripnest.backend.client.GeminiClient;
import com.tripnest.backend.client.GeminiClient.GeminiDestination;
import com.tripnest.backend.client.WikipediaClient;
import com.tripnest.backend.client.WikipediaClient.WikipediaInfo;
import com.tripnest.backend.dto.DestinationResponse;
import com.tripnest.backend.service.DestinationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DestinationServiceImpl implements DestinationService {

    private final GeminiClient geminiClient;
    private final WikipediaClient wikipediaClient;

    @Override
    public List<DestinationResponse> getDestinations(String country, String state) {
        log.info("Processing destinations request for Country: {}, State: {}", country, state);

        // Step 1: Call Gemini Client
        List<GeminiDestination> geminiDestinations = geminiClient.getDestinations(country, state);

        if (geminiDestinations == null || geminiDestinations.isEmpty()) {
            log.warn("No destinations retrieved from Gemini client. Returning empty list.");
            return Collections.emptyList();
        }

        List<DestinationResponse> responses = new ArrayList<>();

        // Step 2 & 3: For each destination, fetch Wikipedia details and merge
        for (GeminiDestination dest : geminiDestinations) {
            String name = dest.getName();
            String famousFor = dest.getFamousFor();

            log.info("Enriching destination: {}", name);
            WikipediaInfo wikiInfo = wikipediaClient.fetchSummary(name);

            DestinationResponse.DestinationResponseBuilder builder = DestinationResponse.builder()
                    .name(name)
                    .famousFor(famousFor);

            if (wikiInfo != null) {
                builder.shortDescription(wikiInfo.getDescription())
                        .fullDescription(wikiInfo.getExtract())
                        .thumbnail(wikiInfo.getThumbnail() != null ? wikiInfo.getThumbnail().getSource() : null)
                        .image(wikiInfo.getOriginalimage() != null ? wikiInfo.getOriginalimage().getSource() : null)
                        .latitude(wikiInfo.getCoordinates() != null ? wikiInfo.getCoordinates().getLat() : null)
                        .longitude(wikiInfo.getCoordinates() != null ? wikiInfo.getCoordinates().getLon() : null)
                        .wikipediaUrl(wikiInfo.getContent_urls() != null && wikiInfo.getContent_urls().getDesktop() != null 
                                ? wikiInfo.getContent_urls().getDesktop().getPage() : null);
            } else {
                log.warn("Wikipedia info not available for: {}", name);
            }

            responses.add(builder.build());
        }

        log.info("Enriched and returning {} destinations total.", responses.size());
        return responses;
    }
}
