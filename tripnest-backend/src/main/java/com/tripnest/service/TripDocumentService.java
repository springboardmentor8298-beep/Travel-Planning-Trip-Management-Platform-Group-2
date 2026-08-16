package com.tripnest.service;

import com.tripnest.dto.TripDocumentResponse;
import com.tripnest.entity.DocumentType;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TripDocument;
import com.tripnest.entity.User;
import com.tripnest.repository.TripDocumentRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripDocumentService {

    private final TripDocumentRepository tripDocumentRepository;
    private final UserRepository userRepository;
    private final TripAccessService tripAccessService;
    private final FileStorageService fileStorageService;

    public TripDocumentResponse uploadDocument(String email, Long tripId, MultipartFile file, DocumentType type) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertCanEdit(email, trip);

        User uploader = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String storedPath = fileStorageService.store(tripId, file);
        String uploadedName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";

        TripDocument document = TripDocument.builder()
                .trip(trip)
                .uploadedBy(uploader)
                .originalFileName(uploadedName)
                .storedFilePath(storedPath)
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .documentType(type)
                .build();

        tripDocumentRepository.save(document);
        return toResponse(document);
    }

    public List<TripDocumentResponse> getDocumentsForTrip(String email, Long tripId) {
        Trip trip = tripAccessService.findTripOrThrow(tripId);
        tripAccessService.assertHasAccess(email, trip);

        return tripDocumentRepository.findByTripIdOrderByUploadedAtDesc(tripId).stream()
                .map(this::toResponse)
                .toList();
    }

    public TripDocument getDocumentEntityForDownload(String email, Long documentId) {
        TripDocument document = tripDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        tripAccessService.assertHasAccess(email, document.getTrip());
        return document;
    }

    public Resource loadFileResource(TripDocument document) {
        return fileStorageService.loadAsResource(document.getStoredFilePath());
    }

    private TripDocumentResponse toResponse(TripDocument d) {
        return new TripDocumentResponse(
                d.getId(), d.getTrip().getId(), d.getOriginalFileName(), d.getContentType(),
                d.getDocumentType(), d.getUploadedBy().getEmail(), d.getUploadedAt()
        );
    }
}
