package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "favorite_destinations", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "destination_id"}))
public class FavoriteDestination {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "user_id", nullable = false) private User user;
    @ManyToOne @JoinColumn(name = "destination_id", nullable = false) private Destination destination;
}
