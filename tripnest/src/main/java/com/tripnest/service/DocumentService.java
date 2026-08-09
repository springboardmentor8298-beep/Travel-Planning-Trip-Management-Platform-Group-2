package com.tripnest.service;

import com.tripnest.dto.DocumentResponse;
import com.tripnest.entity.*;
import com.tripnest.repository.TravelDocumentRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for travel document upload, list, download, and delete.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {

    @Value("${tripnest.upload.dir:uploads}")
    private String uploadDir;

    private final TravelDocumentRepository documentRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // Upload
    // -------------------------------------------------------------------------

    public DocumentResponse uploadDocument(Long tripId, Long userId, String docTypeStr, MultipartFile file) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        DocumentType docType;
        try {
            docType = DocumentType.valueOf(docTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            docType = DocumentType.OTHER;
        }

        // Build storage path: uploads/trips/{tripId}/{uuid}_{originalName}
        String originalName = Paths.get(file.getOriginalFilename()).getFileName().toString();
        String storedName = UUID.randomUUID() + "_" + originalName;
        Path targetDir = Paths.get(uploadDir, "trips", tripId.toString());
        Path targetPath = targetDir.resolve(storedName);

        try {
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file: " + e.getMessage());
        }

        TravelDocument doc = new TravelDocument();
        doc.setTrip(trip);
        doc.setUser(user);
        doc.setDocType(docType);
        doc.setFileName(originalName);
        doc.setFilePath(targetPath.toString());

        return toResponse(documentRepository.save(doc), tripId);
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocuments(Long tripId) {
        return documentRepository.findByTripIdOrderByUploadedAtDesc(tripId)
                .stream()
                .map(d -> toResponse(d, tripId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long tripId, Long docId) {
        TravelDocument doc = documentRepository.findByIdAndTripId(docId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        try {
            Path filePath = Paths.get(doc.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found on disk");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid file path");
        }
    }

    public String getFileName(Long tripId, Long docId) {
        TravelDocument doc = documentRepository.findByIdAndTripId(docId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        return doc.getFileName();
    }

    public String getContentType(Long tripId, Long docId) {
        TravelDocument doc = documentRepository.findByIdAndTripId(docId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        try {
            Path path = Paths.get(doc.getFilePath());
            String contentType = Files.probeContentType(path);
            return contentType != null ? contentType : "application/octet-stream";
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    public void deleteDocument(Long tripId, Long docId, Long userId) {
        TravelDocument doc = documentRepository.findByIdAndTripId(docId, tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        if (!doc.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your document");
        }
        // Delete physical file
        try {
            Files.deleteIfExists(Paths.get(doc.getFilePath()));
        } catch (IOException ignored) { }
        documentRepository.delete(doc);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private DocumentResponse toResponse(TravelDocument doc, Long tripId) {
        DocumentResponse res = new DocumentResponse();
        res.setId(doc.getId());
        res.setTripId(tripId);
        res.setUserId(doc.getUser().getId());
        res.setUploaderUsername(doc.getUser().getUsername());
        res.setDocType(doc.getDocType());
        res.setFileName(doc.getFileName());
        res.setDownloadUrl("/api/trips/" + tripId + "/documents/" + doc.getId() + "/download");
        res.setUploadedAt(doc.getUploadedAt());
        return res;
    }
}
