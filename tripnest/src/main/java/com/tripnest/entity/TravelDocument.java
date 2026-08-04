package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * TravelDocument entity — stores uploaded travel documents per trip.
 *
 * Schema:
 * CREATE TABLE travel_documents (
 *   id          BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   trip_id     BIGINT NOT NULL,
 *   user_id     BIGINT NOT NULL,
 *   doc_type    VARCHAR(30) NOT NULL,
 *   file_name   VARCHAR(255) NOT NULL,
 *   file_path   VARCHAR(500) NOT NULL,
 *   uploaded_at DATETIME NOT NULL,
 *   FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 30)
    private DocumentType docType = DocumentType.OTHER;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
