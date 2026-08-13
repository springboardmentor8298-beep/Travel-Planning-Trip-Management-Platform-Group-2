# TripNest — Week 1 & 2 Setup Guide

## What's included
- `tripnest-backend/` — Spring Boot 3 project: entities (User, Role), JWT auth, Register/Login APIs, Security config
- `tripnest-frontend/` — React skeleton: Login, Register, protected Dashboard, Axios with JWT interceptor

## Step 1 — Backend Setup

1. Install: **Java 17**, **Maven**, **MySQL** (local dev DB per your tech stack doc)
2. Open `tripnest-backend/` in IntelliJ IDEA (recommended) or VS Code
3. Edit `src/main/resources/application.properties`:
   - Set `spring.datasource.password` to your actual MySQL root password
   - Change `app.jwt.secret` to any long random string
4. Create the database (auto-created by `createDatabaseIfNotExist=true`, or manually):
   ```sql
   CREATE DATABASE tripnest_db;
   ```
5. Run the app:
   ```bash
   cd tripnest-backend
   mvn spring-boot:run
   ```
6. It should start on `http://localhost:8080`. Hibernate auto-creates the `users` and `roles` tables.

## Step 2 — Test Auth APIs in Postman

**Register**
```
POST http://localhost:8080/api/auth/register
Body (JSON):
{
  "fullName": "Karthik Raja",
  "email": "karthik@test.com",
  "password": "test123"
}
```
Expect: `200 OK` with `{ token, email, fullName }`

**Login**
```
POST http://localhost:8080/api/auth/login
Body (JSON):
{
  "email": "karthik@test.com",
  "password": "test123"
}
```
Expect: `200 OK` with a JWT token.

If both work — Milestone 1's core backend requirement is done.

## Step 3 — Frontend Setup

1. Install **Node.js** (v18+)
2. ```bash
   cd tripnest-frontend
   npm install
   npm start
   ```
3. Opens at `http://localhost:3000`
4. Go to `/register` → create an account → should redirect to `/dashboard`
5. Refresh, logout, then `/login` → should work with the same credentials

## Step 4 — Verify Week 1&2 Milestone (per your plan doc)
- [x] Spring Boot project setup completed
- [x] JWT authentication implemented
- [x] Database schema finalized (Users, Roles — Trips/Itineraries etc. come in Week 3-4)
- [x] Frontend authentication flow working
- [x] Role-based access control configured
- [x] Profile management (get/update/change password)

## Week 2 — What's new

| Feature | Endpoint | File |
|---|---|---|
| Get my profile | `GET /api/users/me` | `UserController.java` |
| Update my profile | `PUT /api/users/me` | `UserController.java` |
| Change password | `PUT /api/users/me/password` | `UserController.java` |
| Admin-only demo (RBAC proof) | `GET /api/admin/dashboard-stub` | `AdminController.java` |

**Import `TripNest-Week1-2.postman_collection.json`** into Postman — run requests 1→6 in order. Request 2 (Login) returns a token; paste it into the collection variable `token` (top-right eye icon → edit) before running 3-6.

Request 6 should return **403 Forbidden** when logged in as a freshly registered user (default role = TRAVELER). That 403 is the proof RBAC works — not a bug.

## Deferred to later (per project plan, flagged deliberately)
- OAuth2 Google Login — complexity risk before review, revisit Week 3
- Email-based password reset — needs SMTP/JavaMailSender setup, revisit with Week 5-6 notifications work


## Common Beginner Errors
| Error | Fix |
|---|---|
| `Communications link failure` | MySQL not running — start MySQL service |
| `Access denied for user 'root'` | Wrong password in `application.properties` |
| `401 Unauthorized` on login | Check password matches what you registered with |
| CORS error in browser console | Confirm frontend runs on `localhost:3000` (matches `SecurityConfig` CORS origin) |
| `Bean not found` on startup | Run `mvn clean install` first |
