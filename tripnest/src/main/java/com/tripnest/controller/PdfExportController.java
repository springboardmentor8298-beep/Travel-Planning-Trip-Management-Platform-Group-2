package com.tripnest.controller;

import com.tripnest.security.services.UserDetailsImpl;
import com.tripnest.service.PdfExportService;
import com.tripnest.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

/**
 * Controller for exporting trip itinerary and expense summaries as PDF files.
 */
@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class PdfExportController {

    private final PdfExportService pdfExportService;
    private final TripService tripService;

    @GetMapping("/{id}/export/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InputStreamResource> exportTripPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Validate trip access for authenticated user
        tripService.getTripById(id, userDetails.getId());

        ByteArrayInputStream pdfStream = pdfExportService.generateTripPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tripnest_trip_" + id + ".pdf\"");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }
}
