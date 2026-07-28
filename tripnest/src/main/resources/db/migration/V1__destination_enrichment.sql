-- Applies to legacy databases once Flyway baselines their existing schema at version 0.
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS travel_guide VARCHAR(2000);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS attractions VARCHAR(2000);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS latitude DOUBLE;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS longitude DOUBLE;
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(100) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id)
);
