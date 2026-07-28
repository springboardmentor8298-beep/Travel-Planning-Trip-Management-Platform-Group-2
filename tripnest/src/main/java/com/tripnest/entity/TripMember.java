package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name="trip_members", uniqueConstraints=@UniqueConstraint(columnNames={"trip_id","user_id"}))
public class TripMember {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne @JoinColumn(name="trip_id", nullable=false) private Trip trip;
 @ManyToOne @JoinColumn(name="user_id", nullable=false) private User user;
 @Column(nullable=false) private String memberRole;
}
