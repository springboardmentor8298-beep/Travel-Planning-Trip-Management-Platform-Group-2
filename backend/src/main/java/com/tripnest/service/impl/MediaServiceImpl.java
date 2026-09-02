package com.tripnest.service.impl;

import com.tripnest.entity.Trip;
import com.tripnest.entity.TripMedia;
import com.tripnest.entity.User;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedException;
import com.tripnest.repository.TripMediaRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.service.MediaService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class MediaServiceImpl implements MediaService {

    private final TripMediaRepository tripMediaRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;

    private static final String UPLOAD_DIR = "uploads/trips/";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "webp", "gif", "pdf", "doc", "docx", "txt"
    );

    public MediaServiceImpl(TripMediaRepository tripMediaRepository,
                            TripRepository tripRepository,
                            UserRepository userRepository,
                            TripMemberRepository tripMemberRepository) {
        this.tripMediaRepository = tripMediaRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.tripMemberRepository = tripMemberRepository;
    }

    @Override
    public TripMedia uploadMedia(Integer tripId, MultipartFile file, String category, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));

        verifyTripAccess(trip, user);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit.");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase()
                : "";

        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("File type ." + ext + " is not supported.");
        }

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String newFilename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path targetPath = Paths.get(UPLOAD_DIR + newFilename);
            Files.copy(file.getInputStream(), targetPath);

            String mediaCategory = category != null && !category.trim().isEmpty()
                    ? category.toUpperCase()
                    : (Arrays.asList("pdf", "doc", "docx", "txt").contains(ext) ? "DOCUMENT" : "PHOTO");

            TripMedia media = new TripMedia();
            media.setTrip(trip);
            media.setUser(user);
            media.setFileName(originalFilename);
            media.setFileType(file.getContentType());
            media.setFileSize(file.getSize());
            media.setFilePath("/uploads/trips/" + newFilename);
            media.setMediaCategory(mediaCategory);
            media.setUploadedAt(LocalDateTime.now());

            return tripMediaRepository.save(media);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public List<TripMedia> getMediaByTripId(Integer tripId, String category, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));

        verifyTripAccess(trip, user);

        if (category != null && !category.trim().isEmpty()) {
            return tripMediaRepository.findByTrip_TripIdAndMediaCategory(tripId, category.toUpperCase());
        }
        return tripMediaRepository.findByTrip_TripId(tripId);
    }

    @Override
    public void deleteMedia(Integer mediaId, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        TripMedia media = tripMediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found: " + mediaId));

        verifyTripAccess(media.getTrip(), user);
        tripMediaRepository.delete(media);
    }

    private void verifyTripAccess(Trip trip, User user) {
        boolean isOwner = trip.getUser().getUserId().equals(user.getUserId());
        boolean isMember = tripMemberRepository.existsByTrip_TripIdAndUser_UserId(trip.getTripId(), user.getUserId());
        if (!isOwner && !isMember) {
            throw new UnauthorizedException("You do not have permission to access media for this trip.");
        }
    }
}
