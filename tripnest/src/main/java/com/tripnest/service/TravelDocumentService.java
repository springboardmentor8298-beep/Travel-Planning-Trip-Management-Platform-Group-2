package com.tripnest.service;

import com.tripnest.dto.TravelDocumentRequest;
import com.tripnest.entity.TravelDocument;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.TravelDocumentRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TravelDocumentService {

    private final TravelDocumentRepository documentRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public TravelDocument createDocument(Long tripId, Long userId, TravelDocumentRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TravelDocument document = new TravelDocument();
        document.setName(request.getName());
        document.setDocumentType(request.getDocumentType());
        document.setFileUrl(request.getFileUrl());
        document.setFileSize(request.getFileSize());
        document.setDescription(request.getDescription());
        document.setExpiryDate(request.getExpiryDate());
        document.setTrip(trip);
        document.setUser(user);

        return documentRepository.save(document);
    }

    public TravelDocument updateDocument(Long documentId, TravelDocumentRequest request) {
        TravelDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        document.setName(request.getName());
        document.setDocumentType(request.getDocumentType());
        document.setFileUrl(request.getFileUrl());
        document.setFileSize(request.getFileSize());
        document.setDescription(request.getDescription());
        document.setExpiryDate(request.getExpiryDate());

        return documentRepository.save(document);
    }

    public void deleteDocument(Long documentId) {
        documentRepository.deleteById(documentId);
    }

    public TravelDocument getDocument(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    public List<TravelDocument> getTripDocuments(Long tripId) {
        return documentRepository.findByTripIdOrderByUploadedAtDesc(tripId);
    }

    public List<TravelDocument> getUserDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByUploadedAtDesc(userId);
    }

    public List<TravelDocument> getTripDocumentsByType(Long tripId, String documentType) {
        return documentRepository.findByTripIdAndDocumentTypeOrderByUploadedAtDesc(tripId, documentType);
    }
}
