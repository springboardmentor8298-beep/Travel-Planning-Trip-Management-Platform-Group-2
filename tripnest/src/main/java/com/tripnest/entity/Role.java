package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Role entity — maps to the `roles` table.
 * <p>
 * Schema:
 * CREATE TABLE roles (
 *   id   INT PRIMARY KEY AUTO_INCREMENT,
 *   name VARCHAR(20) NOT NULL
 * );
 *
 * Pre-populated rows:
 *   INSERT INTO roles(name) VALUES ('ROLE_TRAVELER');
 *   INSERT INTO roles(name) VALUES ('ROLE_AGENT');
 *   INSERT INTO roles(name) VALUES ('ROLE_ADMIN');
 */
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ERole name;
}
