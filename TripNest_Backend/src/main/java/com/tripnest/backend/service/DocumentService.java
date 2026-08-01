package com.tripnest.backend.service;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.DocumentResponse;

public interface DocumentService {

    ApiResponse<DocumentResponse> uploadDocument(Long tripId, MultipartFile file, String documentType);

    ApiResponse<List<DocumentResponse>> getTripDocuments(Long tripId);

    byte[] downloadDocument(Long documentId);

    String getDocumentContentType(Long documentId);

    String getDocumentName(Long documentId);

    ApiResponse<String> deleteDocument(Long documentId);
}
