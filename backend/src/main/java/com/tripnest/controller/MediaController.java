package com.tripnest.controller;

import com.tripnest.entity.TripMedia;
import com.tripnest.service.MediaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    public ResponseEntity<List<TripMedia>> getTripMedia(
            @PathVariable("tripId") Integer tripId,
            @RequestParam(value = "category", required = false) String category,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TripMedia> media = mediaService.getMediaByTripId(tripId, category, userDetails.getUsername());
        return ResponseEntity.ok(media);
    }

    @PostMapping
    public ResponseEntity<TripMedia> uploadMedia(
            @PathVariable("tripId") Integer tripId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category,
            @AuthenticationPrincipal UserDetails userDetails) {
        TripMedia uploaded = mediaService.uploadMedia(tripId, file, category, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<String> deleteMedia(
            @PathVariable("tripId") Integer tripId,
            @PathVariable("mediaId") Integer mediaId,
            @AuthenticationPrincipal UserDetails userDetails) {
        mediaService.deleteMedia(mediaId, userDetails.getUsername());
        return ResponseEntity.ok("Media file deleted successfully!");
    }
}
