package com.tripnest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * TravelDocument entity — represents travel documents for trips
 *
 * Schema:
 * CREATE TABLE travel_documents (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   name           VARCHAR(200) NOT NULL,
 *   document_type  VARCHAR(50) NOT NULL,
 *   file_url       VARCHAR(500) NOT NULL,
 *   file_size      BIGINT,
 *   description    TEXT,
 *   expiry_date    TIMESTAMP,
 *   uploaded_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *   trip_id        BIGINT NOT NULL,
 *   user_id        BIGINT NOT NULL,
 *   FOREIGN KEY (trip_id) REFERENCES trips(id),
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "travel_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @NotBlank
    @Size(max = 500)
    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
