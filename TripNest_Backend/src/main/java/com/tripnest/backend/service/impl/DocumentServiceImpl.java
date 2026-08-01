package com.tripnest.backend.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.DocumentResponse;
import com.tripnest.backend.entity.Document;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.exception.BadRequestException;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.DocumentRepository;
import com.tripnest.backend.repository.TripMemberRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.DocumentService;
import com.tripnest.backend.service.StorageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;
    private final StorageService storageService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateTripAccess(Trip trip) {
        User currentUser = getCurrentUser();
        if (trip.getUser().getId().equals(currentUser.getId())) {
            return;
        }
        boolean isMember = tripMemberRepository.findByTripAndUser(trip, currentUser)
                .filter(m -> "ACCEPTED".equalsIgnoreCase(m.getStatus()))
                .isPresent();
        if (!isMember) {
            throw new AccessDeniedException("You do not have access to this trip");
        }
    }

    private void validateTripEditPermission(Trip trip) {
        User currentUser = getCurrentUser();
        if (trip.getUser().getId().equals(currentUser.getId())) {
            return;
        }
        String role = tripMemberRepository.findByTripAndUser(trip, currentUser)
                .filter(m -> "ACCEPTED".equalsIgnoreCase(m.getStatus()))
                .map(m -> m.getRole().toUpperCase())
                .orElse("MEMBER");
        if (!"OWNER".equals(role) && !"EDITOR".equals(role)) {
            throw new AccessDeniedException("You do not have permission to modify files on this trip");
        }
    }

    private String formatFileSize(long size) {
        if (size <= 0) return "0 B";
        final String[] units = new String[] { "B", "KB", "MB" };
        int digitGroups = (int) (Math.log10(size)/Math.log10(1024));
        if (digitGroups >= units.length) {
            digitGroups = units.length - 1;
        }
        return new java.text.DecimalFormat("#,##0.#").format(size/Math.pow(1024, digitGroups)) + " " + units[digitGroups];
    }

    @Override
    @Transactional
    public ApiResponse<DocumentResponse> uploadDocument(Long tripId, MultipartFile file, String documentType) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        validateTripEditPermission(trip);

        if (file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        // Validate File Size (Max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds maximum limit of 10MB");
        }

        // Validate File Type
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new BadRequestException("Invalid file name");
        }
        String extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
        if (!extension.equals(".pdf") && !extension.equals(".jpg") && !extension.equals(".jpeg") && !extension.equals(".png")) {
            throw new BadRequestException("File type not allowed. Allowed types: PDF, JPG, JPEG, PNG");
        }

        // Store file
        String filePath = storageService.storeFile(file, tripId.toString());

        Document doc = Document.builder()
                .name(originalName)
                .type(documentType)
                .size(formatFileSize(file.getSize()))
                .filePath(filePath)
                .contentType(file.getContentType())
                .trip(trip)
                .build();

        doc = documentRepository.save(doc);

        DocumentResponse response = DocumentResponse.builder()
                .id(doc.getId())
                .name(doc.getName())
                .type(doc.getType())
                .size(doc.getSize())
                .uploadedAt(doc.getCreatedAt())
                .build();

        return ApiResponse.<DocumentResponse>builder()
                .success(true)
                .message("Document uploaded successfully")
                .data(response)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DocumentResponse>> getTripDocuments(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        validateTripAccess(trip);

        List<DocumentResponse> list = documentRepository.findByTrip(trip)
                .stream()
                .map(doc -> DocumentResponse.builder()
                        .id(doc.getId())
                        .name(doc.getName())
                        .type(doc.getType())
                        .size(doc.getSize())
                        .uploadedAt(doc.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.<List<DocumentResponse>>builder()
                .success(true)
                .message("Documents retrieved successfully")
                .data(list)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadDocument(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        validateTripAccess(doc.getTrip());

        return storageService.loadFile(doc.getFilePath());
    }

    @Override
    @Transactional(readOnly = true)
    public String getDocumentContentType(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        return doc.getContentType();
    }

    @Override
    @Transactional(readOnly = true)
    public String getDocumentName(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        return doc.getName();
    }

    @Override
    @Transactional
    public ApiResponse<String> deleteDocument(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        validateTripEditPermission(doc.getTrip());

        // Delete physical file
        storageService.deleteFile(doc.getFilePath());

        // Delete record
        documentRepository.delete(doc);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Document deleted successfully")
                .data("Document deleted successfully")
                .build();
    }
}
