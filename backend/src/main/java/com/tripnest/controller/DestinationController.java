package com.tripnest.controller;

import com.tripnest.dto.destination.DestinationRequest;
import com.tripnest.dto.destination.DestinationResponse;
import com.tripnest.dto.response.ApiResponse;
import com.tripnest.service.DestinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/destinations")
@RequiredArgsConstructor
@Tag(name = "Destinations", description = "Browse and manage travel destinations")
public class DestinationController {

    private final DestinationService destinationService;

    @GetMapping
    @Operation(summary = "Search and list destinations")
    public ApiResponse<Page<DestinationResponse>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.success(destinationService.search(search, country, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single destination")
    public ApiResponse<DestinationResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(destinationService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a destination (admin only)")
    public ResponseEntity<ApiResponse<DestinationResponse>> create(@Valid @RequestBody DestinationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(destinationService.create(request), "Destination created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a destination (admin only)")
    public ApiResponse<DestinationResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody DestinationRequest request) {
        return ApiResponse.success(destinationService.update(id, request), "Destination updated");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a destination (admin only)")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        destinationService.delete(id);
        return ApiResponse.success(null, "Destination deleted");
    }
}
