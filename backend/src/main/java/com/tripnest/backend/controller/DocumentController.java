package com.tripnest.backend.controller;

import com.tripnest.backend.model.DocumentEntity;
import com.tripnest.backend.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/trips/{tripId}/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Value("${app.upload.dir:C:/Users/Thiruppathi/.gemini/antigravity/scratch/tripnest/backend/uploads}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<List<DocumentEntity>> getDocuments(@PathVariable String tripId) {
        return ResponseEntity.ok(documentRepository.findByTripId(tripId));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @PathVariable String tripId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "type", required = false) String type
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File cannot be empty"));
        }

        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File dest = new File(dir, filename);
            file.transferTo(dest);

            DocumentEntity doc = new DocumentEntity();
            doc.setId("doc_" + UUID.randomUUID().toString().substring(0, 8));
            doc.setTripId(tripId);
            doc.setTitle((title != null && !title.isBlank()) ? title : file.getOriginalFilename());
            doc.setType((type != null && !type.isBlank()) ? type : "PDF");
            doc.setFileUrl("/uploads/" + filename);
            doc.setFileUri(dest.getAbsolutePath());

            DocumentEntity saved = documentRepository.save(doc);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to upload document: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable String tripId, @PathVariable String id) {
        Optional<DocumentEntity> docOpt = documentRepository.findById(id);
        if (docOpt.isPresent()) {
            DocumentEntity doc = docOpt.get();
            if (doc.getFileUri() != null) {
                File file = new File(doc.getFileUri());
                if (file.exists()) {
                    file.delete();
                }
            }
            documentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully from MySQL database and cloud storage"));
        } else {
            documentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully from MySQL database"));
        }
    }
}
