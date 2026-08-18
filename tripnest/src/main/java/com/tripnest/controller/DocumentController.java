package com.tripnest.controller;

import com.tripnest.dto.DocumentResponse;
import com.tripnest.dto.MessageResponse;
import com.tripnest.entity.Document;
import com.tripnest.security.UserDetailsImpl;
import com.tripnest.service.DocumentService;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/documents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(
            DocumentService documentService
    ) {
        this.documentService = documentService;
    }

    // =========================
    // GET ALL DOCUMENTS
    // =========================

    @GetMapping
    public ResponseEntity<?> getDocuments(
            @PathVariable Long tripId
    ) {

        UserDetailsImpl userDetails =
                getCurrentUser();

        List<DocumentResponse> documents =
                documentService.getDocuments(
                        tripId,
                        userDetails.getId()
                );

        return ResponseEntity.ok(documents);
    }

    // =========================
    // UPLOAD DOCUMENT
    // =========================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long tripId,
            @RequestParam("file") MultipartFile file
    ) {

        try {

            UserDetailsImpl userDetails =
                    getCurrentUser();

            DocumentResponse response =
                    documentService.uploadDocument(
                            tripId,
                            userDetails.getId(),
                            file
                    );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================
    // DOWNLOAD DOCUMENT
    // =========================

    @GetMapping("/{documentId}/download")
    public ResponseEntity<?> downloadDocument(
            @PathVariable Long tripId,
            @PathVariable Long documentId
    ) {

        try {

            UserDetailsImpl userDetails =
                    getCurrentUser();

            Document document =
                    documentService.getDocument(
                            documentId,
                            userDetails.getId()
                    );

            Resource resource =
                    documentService.downloadDocument(
                            documentId,
                            userDetails.getId()
                    );

            String contentType =
                    document.getFileType();

            if (contentType == null) {
                contentType =
                        "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    contentType
                            )
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" +
                                    document.getFileName() +
                                    "\""
                    )
                    .body(resource);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================
    // DELETE DOCUMENT
    // =========================

    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long tripId,
            @PathVariable Long documentId
    ) {

        try {

            UserDetailsImpl userDetails =
                    getCurrentUser();

            documentService.deleteDocument(
                    documentId,
                    userDetails.getId()
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Document deleted successfully!"
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================
    // CURRENT USER
    // =========================

    private UserDetailsImpl getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (UserDetailsImpl)
                authentication.getPrincipal();
    }
}