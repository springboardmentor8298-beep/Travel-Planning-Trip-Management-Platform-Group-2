-- Seeds the roles table.
-- Without this, RoleRepository.findByName(...) in AuthController.registerUser()
-- throws "Error: Role is not found." on EVERY signup attempt, which is why
-- signup/login was failing. Runs once at every startup, safe to repeat.
INSERT INTO roles (name)
SELECT * FROM (SELECT 'ROLE_TRAVELER') AS tmp
WHERE NOT EXISTS (SELECT name FROM roles WHERE name = 'ROLE_TRAVELER') LIMIT 1;

INSERT INTO roles (name)
SELECT * FROM (SELECT 'ROLE_GROUP_ADMIN') AS tmp
WHERE NOT EXISTS (SELECT name FROM roles WHERE name = 'ROLE_GROUP_ADMIN') LIMIT 1;

INSERT INTO roles (name)
SELECT * FROM (SELECT 'ROLE_ADMIN') AS tmp
WHERE NOT EXISTS (SELECT name FROM roles WHERE name = 'ROLE_ADMIN') LIMIT 1;
