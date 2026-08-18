package com.tripnest.controller;

import com.tripnest.dto.TravelDocumentResponse;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.TravelDocumentService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/documents")
public class TravelDocumentController {

    private final TravelDocumentService docService;

    public TravelDocumentController(TravelDocumentService docService) {
        this.docService = docService;
    }

    /** Upload a document */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TravelDocumentResponse> upload(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "docType", defaultValue = "OTHER") String docType,
            @RequestParam(value = "description", defaultValue = "") String description) {
        try {
            TravelDocumentResponse res =
                    docService.upload(principal.getUsername(), tripId, file, docType, description);
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /** List all documents for a trip */
    @GetMapping
    public List<TravelDocumentResponse> getDocuments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId) {
        return docService.getDocuments(principal.getUsername(), tripId);
    }

    /** Delete a document */
    @DeleteMapping("/{docId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long tripId,
            @PathVariable Long docId) {
        docService.delete(principal.getUsername(), tripId, docId);
        return ResponseEntity.noContent().build();
    }

    /** Download / serve a stored file by its stored filename */
    @GetMapping("/files/{storedName}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable Long tripId,
            @PathVariable String storedName) {
        try {
            Path path = docService.getFilePath(storedName);
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists()) return ResponseEntity.notFound().build();

            String contentType = "application/octet-stream";
            String lc = storedName.toLowerCase();
            if (lc.endsWith(".pdf"))  contentType = "application/pdf";
            else if (lc.endsWith(".jpg") || lc.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (lc.endsWith(".png"))  contentType = "image/png";
            else if (lc.endsWith(".doc"))  contentType = "application/msword";
            else if (lc.endsWith(".docx")) contentType =
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + storedName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
