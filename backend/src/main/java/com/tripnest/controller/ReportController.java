package com.tripnest.controller;

import com.tripnest.dto.ReportFilterRequest;
import com.tripnest.dto.ReportResponseDTO;
import com.tripnest.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping
    public ResponseEntity<ReportResponseDTO> getReports(
            @RequestParam(name = "tripId", required = false) Integer tripId,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "status", required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails) {

        ReportFilterRequest filter = new ReportFilterRequest();
        filter.setTripId(tripId);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        filter.setCategory(category);
        filter.setStatus(status);

        String email = userDetails != null ? userDetails.getUsername() : null;
        ReportResponseDTO reports = reportService.generateReports(email, filter);
        return ResponseEntity.ok(reports);
    }

    @PostMapping("/filter")
    public ResponseEntity<ReportResponseDTO> getFilteredReports(
            @RequestBody ReportFilterRequest filter,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails != null ? userDetails.getUsername() : null;
        ReportResponseDTO reports = reportService.generateReports(email, filter);
        return ResponseEntity.ok(reports);
    }
}
