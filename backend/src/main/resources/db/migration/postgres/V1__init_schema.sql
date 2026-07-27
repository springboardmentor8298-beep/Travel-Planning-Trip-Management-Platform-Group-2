-- ============================================================
-- TripNest — Milestone 1 baseline schema (PostgreSQL)
-- Note: updated_at is maintained by Hibernate's @LastModifiedDate,
-- so no DB-side trigger is required.
-- ============================================================

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(500),
    provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    home_country VARCHAR(100),
    preferred_currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE destinations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    cover_image_url VARCHAR(500),
    average_rating DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE trips (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    destination_id BIGINT NOT NULL REFERENCES destinations(id),
    owner_id BIGINT NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget DECIMAL(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNING',
    notes TEXT,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_trips_owner ON trips(owner_id);

CREATE TABLE itineraries (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    itinerary_date DATE NOT NULL,
    title VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_itineraries_trip ON itineraries(trip_id);

CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    itinerary_id BIGINT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    activity_type VARCHAR(30) NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    estimated_cost DECIMAL(10,2),
    notes TEXT,
    reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activities_itinerary ON activities(itinerary_id);

CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    planned_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    alert_threshold_percent INT DEFAULT 80,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    paid_by_user_id BIGINT NOT NULL REFERENCES users(id),
    category VARCHAR(30) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    description VARCHAR(255),
    expense_date DATE NOT NULL,
    receipt_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_expenses_trip ON expenses(trip_id);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);

INSERT INTO roles (name) VALUES ('ROLE_TRAVELER'), ('ROLE_GROUP_ADMIN'), ('ROLE_ADMIN');
