-- ========================================================
-- TripNest Database Schema & DDL Script
-- Database: tn_app (New Dedicated Schema)
-- ========================================================

CREATE DATABASE IF NOT EXISTS tn_app;
USE tn_app;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    avatar_uri TEXT,
    total_trips INT DEFAULT 0,
    passport_number VARCHAR(100),
    phone_number VARCHAR(50),
    bio TEXT,
    currency_preference VARCHAR(10) DEFAULT 'USD',
    is_google_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    total_budget DOUBLE DEFAULT 0.0,
    spent_budget DOUBLE DEFAULT 0.0,
    cover_image_url TEXT,
    member_count INT DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Itineraries Table
CREATE TABLE IF NOT EXISTS itineraries (
    id VARCHAR(255) PRIMARY KEY,
    trip_id VARCHAR(255) NOT NULL,
    day_number INT NOT NULL,
    date VARCHAR(50),
    title VARCHAR(255),
    activities_json LONGTEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(255) PRIMARY KEY,
    trip_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DOUBLE NOT NULL,
    category VARCHAR(50) NOT NULL,
    date VARCHAR(50),
    paid_by VARCHAR(255),
    notes TEXT,
    currency VARCHAR(10) DEFAULT 'USD',
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(255) PRIMARY KEY,
    trip_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    file_url TEXT,
    file_uri TEXT,
    qr_code_content TEXT,
    expiry_date VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    trip_id VARCHAR(255),
    booking_type VARCHAR(50),
    provider VARCHAR(255),
    booking_reference VARCHAR(100),
    amount DOUBLE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(255) PRIMARY KEY,
    destination_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    rating DOUBLE,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
