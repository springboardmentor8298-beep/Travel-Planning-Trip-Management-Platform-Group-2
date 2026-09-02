package com.tripnest.dto;

import com.tripnest.model.TravelDocument;
import java.time.LocalDateTime;

public class TravelDocumentResponse {
    private Long   id;
    private Long   tripId;
    private String fileName;
    private String fileUrl;
    private String contentType;
    private Long   fileSize;
    private String docType;
    private String description;
    private String uploadedByName;
    private LocalDateTime uploadedAt;

    public static TravelDocumentResponse fromEntity(TravelDocument d) {
        TravelDocumentResponse r = new TravelDocumentResponse();
        r.id             = d.getId();
        r.tripId         = d.getTrip().getId();
        r.fileName       = d.getFileName();
        r.fileUrl        = d.getFileUrl();
        r.contentType    = d.getContentType();
        r.fileSize       = d.getFileSize();
        r.docType        = d.getDocType().name();
        r.description    = d.getDescription();
        r.uploadedByName = d.getUploadedBy().getFullName();
        r.uploadedAt     = d.getUploadedAt();
        return r;
    }

    public Long   getId()             { return id; }
    public Long   getTripId()         { return tripId; }
    public String getFileName()       { return fileName; }
    public String getFileUrl()        { return fileUrl; }
    public String getContentType()    { return contentType; }
    public Long   getFileSize()       { return fileSize; }
    public String getDocType()        { return docType; }
    public String getDescription()    { return description; }
    public String getUploadedByName() { return uploadedByName; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
}
