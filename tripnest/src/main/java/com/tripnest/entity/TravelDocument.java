package com.tripnest.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "travel_documents")
public class TravelDocument {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String originalFilename;
    @Column(nullable = false, unique = true) private String storageKey;
    @Column(nullable = false) private String documentType;
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    @ManyToOne @JoinColumn(name = "trip_id", nullable = false) private Trip trip;
    @ManyToOne @JoinColumn(name = "uploaded_by", nullable = false) private User uploadedBy;
}
