package com.tripnest.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "documents")
public class DocumentEntity {

    @Id
    private String id;
    private String tripId;
    private String title;
    private String type;
    private String fileUrl;
    
    @Column(length = 1000)
    private String fileUri;
    
    private String qrCodeContent;
    private String expiryDate;
    private String notes;

    public DocumentEntity() {}

    public DocumentEntity(String id, String tripId, String title, String type, String fileUrl, String fileUri, String qrCodeContent, String expiryDate, String notes) {
        this.id = id;
        this.tripId = tripId;
        this.title = title;
        this.type = type;
        this.fileUrl = fileUrl;
        this.fileUri = fileUri;
        this.qrCodeContent = qrCodeContent;
        this.expiryDate = expiryDate;
        this.notes = notes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileUri() { return fileUri; }
    public void setFileUri(String fileUri) { this.fileUri = fileUri; }

    public String getQrCodeContent() { return qrCodeContent; }
    public void setQrCodeContent(String qrCodeContent) { this.qrCodeContent = qrCodeContent; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
