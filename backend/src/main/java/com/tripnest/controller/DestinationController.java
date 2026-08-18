package com.tripnest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.dto.DestinationRequest;
import com.tripnest.dto.DestinationResponse;
import com.tripnest.service.DestinationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    private final DestinationService destService;
    private final ObjectMapper objectMapper;

    @Value("${app.upload.dir:uploads/documents}")
    private String uploadDir;

    public DestinationController(DestinationService destService, ObjectMapper objectMapper) {
        this.destService  = destService;
        this.objectMapper = objectMapper;
    }

    /**
     * List / search destinations.
     * Optional query params: country, type, q (full-text search)
     */
    @GetMapping
    public List<DestinationResponse> getAll(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String q) {
        return destService.getAll(country, type, q);
    }

    /** Get a single destination by id */
    @GetMapping("/{id}")
    public DestinationResponse getById(@PathVariable Long id) {
        return destService.getById(id);
    }

    /**
     * Create a destination — supports multipart (with optional image file)
     * or plain JSON.
     * ADMINISTRATOR or GROUP_ADMIN only.
     */
    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','GROUP_ADMIN')")
    public ResponseEntity<DestinationResponse> createMultipart(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        DestinationRequest req = objectMapper.readValue(dataJson, DestinationRequest.class);
        if (image != null && !image.isEmpty()) {
            req.setImageUrl(saveImage(image));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(destService.create(req));
    }

    @PostMapping(consumes = {"application/json"})
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','GROUP_ADMIN')")
    public ResponseEntity<DestinationResponse> createJson(
            @Valid @RequestBody DestinationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(destService.create(request));
    }

    /**
     * Update a destination — supports multipart or plain JSON.
     */
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','GROUP_ADMIN')")
    public DestinationResponse updateMultipart(
            @PathVariable Long id,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        DestinationRequest req = objectMapper.readValue(dataJson, DestinationRequest.class);
        if (image != null && !image.isEmpty()) {
            req.setImageUrl(saveImage(image));
        }
        return destService.update(id, req);
    }

    @PutMapping(value = "/{id}", consumes = {"application/json"})
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','GROUP_ADMIN')")
    public DestinationResponse updateJson(
            @PathVariable Long id,
            @Valid @RequestBody DestinationRequest request) {
        return destService.update(id, request);
    }

    /** Delete a destination */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        destService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Admin analytics: total destination count + breakdown by type */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public java.util.Map<String, Object> analytics() {
        List<DestinationResponse> all = destService.getAll(null, null, null);
        java.util.Map<String, Long> byType = all.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                d -> d.getType() != null ? d.getType() : "OTHER",
                java.util.stream.Collectors.counting()));
        return java.util.Map.of("total", (long) all.size(), "byType", byType);
    }

    // ── helpers ──────────────────────────────────────────────────────

    private String saveImage(MultipartFile file) throws IOException {
        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String filename = "dest_" + UUID.randomUUID() + ext;
        Path dir = Paths.get(uploadDir, "destinations");
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        // Return a URL the frontend can load via the static resource handler
        return "/uploads/destinations/" + filename;
    }
}
