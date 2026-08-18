package com.tripnest.service;

import com.tripnest.dto.DocumentResponse;
import com.tripnest.entity.Document;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.DocumentRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Value("${tripnest.upload.dir:uploads}")
    private String uploadDir;

    public DocumentService(
            DocumentRepository documentRepository,
            TripRepository tripRepository,
            UserRepository userRepository
    ) {
        this.documentRepository = documentRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // GET DOCUMENTS
    // =========================

    public List<DocumentResponse> getDocuments(
            Long tripId,
            Long userId
    ) {

        getUserTrip(tripId, userId);

        return documentRepository
                .findByTripIdOrderByUploadedAtDesc(tripId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // UPLOAD DOCUMENT
    // =========================

    public DocumentResponse uploadDocument(
            Long tripId,
            Long userId,
            MultipartFile file
    ) throws IOException {

        Trip trip = getUserTrip(tripId, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a file");
        }

        // 25 MB limit
        if (file.getSize() > 25 * 1024 * 1024) {
            throw new RuntimeException(
                    "File size cannot exceed 25 MB"
            );
        }

        Path directory = Paths.get(uploadDir, "trips", String.valueOf(tripId));

        Files.createDirectories(directory);

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null ||
                originalFileName.trim().isEmpty()) {

            throw new RuntimeException("Invalid file name");
        }

        String extension = "";

        int dotIndex = originalFileName.lastIndexOf(".");

        if (dotIndex > 0) {
            extension =
                    originalFileName.substring(dotIndex);
        }

        String storedFileName =
                UUID.randomUUID() + extension;

        Path filePath =
                directory.resolve(storedFileName);

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        Document document = new Document();

        document.setFileName(originalFileName);
        document.setStoredFileName(storedFileName);
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setFilePath(filePath.toString());
        document.setTrip(trip);
        document.setUploadedBy(user);

        Document saved =
                documentRepository.save(document);

        return toResponse(saved);
    }

    // =========================
    // DOWNLOAD DOCUMENT
    // =========================

    public Resource downloadDocument(
            Long documentId,
            Long userId
    ) throws IOException {

        Document document =
                getUserDocument(documentId, userId);

        Path path =
                Paths.get(document.getFilePath());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists() ||
                !resource.isReadable()) {

            throw new RuntimeException(
                    "File not found"
            );
        }

        return resource;
    }

    // =========================
    // GET DOCUMENT
    // =========================

    public Document getDocument(
            Long documentId,
            Long userId
    ) {

        return getUserDocument(documentId, userId);
    }

    // =========================
    // DELETE DOCUMENT
    // =========================

    public void deleteDocument(
            Long documentId,
            Long userId
    ) throws IOException {

        Document document =
                getUserDocument(documentId, userId);

        Path path =
                Paths.get(document.getFilePath());

        Files.deleteIfExists(path);

        documentRepository.delete(document);
    }

    // =========================
    // CHECK TRIP OWNERSHIP
    // =========================

    private Trip getUserTrip(
            Long tripId,
            Long userId
    ) {

        Trip trip =
                tripRepository.findById(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trip not found"
                                )
                        );

        if (trip.getUser() == null ||
                !trip.getUser()
                        .getId()
                        .equals(userId)) {

            throw new RuntimeException(
                    "You do not have access to this trip"
            );
        }

        return trip;
    }

    // =========================
    // CHECK DOCUMENT OWNERSHIP
    // =========================

    private Document getUserDocument(
            Long documentId,
            Long userId
    ) {

        Document document =
                documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Document not found"
                                )
                        );

        if (document.getTrip() == null ||
                document.getTrip().getUser() == null ||
                !document.getTrip()
                        .getUser()
                        .getId()
                        .equals(userId)) {

            throw new RuntimeException(
                    "You do not have access to this document"
            );
        }

        return document;
    }

    // =========================
    // RESPONSE
    // =========================

    private DocumentResponse toResponse(
            Document document
    ) {

        return new DocumentResponse(
                document.getId(),
                document.getFileName(),
                document.getFileType(),
                document.getFileSize(),
                document.getUploadedAt(),
                document.getTrip().getId()
        );
    }
}