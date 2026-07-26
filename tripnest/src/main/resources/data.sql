-- =============================================================
-- TripNest Database Schema
-- =============================================================
-- Run this script manually OR let Hibernate auto-create
-- the tables (spring.jpa.hibernate.ddl-auto=update).
-- After tables are created, seed the roles:

-- Seed roles (REQUIRED before first user registration)
INSERT IGNORE INTO roles(name) VALUES ('ROLE_TRAVELER');
INSERT IGNORE INTO roles(name) VALUES ('ROLE_AGENT');
INSERT IGNORE INTO roles(name) VALUES ('ROLE_ADMIN');
