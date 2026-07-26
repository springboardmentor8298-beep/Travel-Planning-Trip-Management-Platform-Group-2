<div align="center">

# TripNest

**Travel Planning & Trip Management Platform**

A full-stack web application for planning trips, building day-wise itineraries, discovering destinations, and collaborating on travel plans with friends and family.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen)
![React](https://img.shields.io/badge/React-18-61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1)
![License](https://img.shields.io/badge/status-in%20development-yellow)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Project Status](#project-status)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Contributing Notes](#contributing-notes)

---

## Overview

TripNest enables travelers to:

- Create accounts and manage personal travel profiles
- Plan and manage trips with budgets, dates, and status tracking
- Share trips and collaborate with other travelers
- Build detailed, day-wise itineraries with scheduled activities
- Discover destinations with descriptions, attractions, and travel guides

The platform is built as a decoupled full-stack application — a Spring Boot REST API backend and a React single-page application frontend — following a layered architecture (Controller → Service → Repository → Database) for maintainability and testability.

---

## Project Status

Development follows a structured 4-milestone plan. **Milestones 1 and 2 are complete.**

| Milestone | Scope | Status |
|---|---|---|
| **Milestone 1** | Auth & Role-Based Access, Profile Management, Trip Management | ✅ **Complete** |
| **Milestone 2** | Itinerary Planning, Activity Scheduling, Destination Discovery | ✅ **Complete** |
| **Milestone 3** | Budget & Expense Management, Group Collaboration, Notifications | 🔜 **Next** |
| **Milestone 4** | Analytics Dashboard, Testing, Deployment | ⏳ Planned |

### Completed Modules

<table>
<tr><th>#</th><th>Module</th><th>Milestone</th><th>Status</th></tr>
<tr><td>1</td><td>User Authentication & Role-Based Access</td><td>1</td><td>✅</td></tr>
<tr><td>2</td><td>User Profile Management</td><td>1</td><td>✅</td></tr>
<tr><td>3</td><td>Trip Management System</td><td>1</td><td>✅</td></tr>
<tr><td>4</td><td>Itinerary Planning System</td><td>2</td><td>✅</td></tr>
<tr><td>5</td><td>Destination Discovery System</td><td>2</td><td>✅</td></tr>
<tr><td>6</td><td>Budget & Expense Management</td><td>3</td><td>🔜</td></tr>
<tr><td>7</td><td>Group Collaboration System</td><td>3</td><td>🔜</td></tr>
<tr><td>8</td><td>Notification System</td><td>3</td><td>🔜</td></tr>
<tr><td>9</td><td>Media & Document Management</td><td>3</td><td>🔜</td></tr>
<tr><td>10</td><td>Reports & Analytics</td><td>4</td><td>⏳</td></tr>
<tr><td>11</td><td>Payment Management (Optional)</td><td>4</td><td>⏳</td></tr>
<tr><td>12</td><td>Final Integration, Testing & Deployment</td><td>4</td><td>⏳</td></tr>
</table>

> OAuth2 (Google Login) and password reset are part of Module 1's original scope but deferred — the JWT authentication foundation shipped here is what they will plug into.

---

## Architecture

```
┌─────────────────┐        HTTPS / REST         ┌──────────────────────┐
│                  │  ───────────────────────►   │                      │
│  React Frontend  │                              │  Spring Boot Backend │
│  (Port 3000)     │  ◄───────────────────────   │  (Port 8080)         │
│                  │        JSON + JWT            │                      │
└─────────────────┘                              └──────────┬───────────┘
                                                              │
                                                    JPA / Hibernate
                                                              │
                                                     ┌────────▼────────┐
                                                     │      MySQL      │
                                                     │   tripnest_db   │
                                                     └──────────────────┘
```

**Backend request flow:**

```
Controller  →  Service  →  Repository  →  Entity  →  MySQL
     ▲
     │
JwtAuthFilter (validates Authorization: Bearer <token> on every request)
```

- **Stateless authentication** — no server-side sessions; every request is authenticated independently via JWT.
- **Layered separation of concerns** — controllers handle HTTP, services hold business logic, repositories handle persistence.
- **Ownership-based authorization** — trip and itinerary mutations are restricted to the resource owner at the service layer, independent of Spring Security's role checks.

---

## Tech Stack

### Backend

| Category | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2.5 |
| Security | Spring Security, JWT (`io.jsonwebtoken`) |
| Persistence | Spring Data JPA, Hibernate |
| Database (local dev) | MySQL 8 |
| Database (production target) | PostgreSQL |
| Validation | Jakarta Bean Validation |
| Build Tool | Maven |

### Frontend

| Category | Technology |
|---|---|
| Library | React 18 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Styling | Tailwind CSS |
| State | React Context API |

---

## Project Structure

```
tripnest/
├── backend/
│   └── src/main/java/com/tripnest/
│       ├── config/          # Spring Security configuration
│       ├── controller/      # REST API endpoints
│       ├── dto/             # Request/response payloads
│       ├── exception/       # Custom exceptions + global handler
│       ├── model/           # JPA entities (database tables)
│       ├── repository/      # Spring Data JPA repositories
│       ├── security/        # JWT utilities, filters, UserDetails
│       └── service/         # Business logic
└── frontend/
    └── src/
        ├── api/              # Axios client + endpoint modules
        ├── components/       # Reusable UI components
        ├── context/          # Auth context/state
        └── pages/            # Route-level page components
```

---

## Database Schema

Six tables currently in use:

| Table | Description |
|---|---|
| `users` | Registered accounts — profile, credentials, role |
| `trips` | Trip records — destination, dates, budget, status, owner |
| `trip_travelers` | Join table for trip sharing (many-to-many: trips ↔ users) |
| `itineraries` | Day-wise itinerary entries, linked to a trip |
| `activities` | Scheduled activities within an itinerary day |
| `destinations` | Standalone, browsable destination catalog |

**Key relationships:**
- `trips.owner_id → users.id` (many-to-one)
- `trip_travelers` links `trips` ↔ `users` (many-to-many, for sharing)
- `itineraries.trip_id → trips.id` (many-to-one)
- `activities.itinerary_id → itineraries.id` (many-to-one)

Tables are created and evolved automatically via Hibernate (`spring.jpa.hibernate.ddl-auto=update`) — no manual SQL migration is required for local development.

---

## Getting Started

### Prerequisites

- **Java 17** or newer (JDK)
- **Maven** (bundled wrapper not required if Maven is on PATH)
- **Node.js 18+** and npm
- **MySQL 8** — installed and running locally

### Backend Setup

1. **Configure the database connection.**

   Open `backend/src/main/resources/application.properties` and set your MySQL password:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/tripnest_db?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=CHANGE_ME
   ```

   The `createDatabaseIfNotExist=true` flag means `tripnest_db` and all tables are created automatically on first run — no manual schema setup needed.

2. **Run the application.**

   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Verify a successful MySQL connection** by checking the startup logs for:

   ```
   HikariPool-1 - Added connection conn0: url=jdbc:mysql://localhost:3306/tripnest_db
   ```

   The API is now available at `http://localhost:8080`.

> **Switching databases:** `application.properties` contains exactly one active `spring.datasource.*` block (MySQL), with commented-out H2 and PostgreSQL alternatives below it for reference. Only one block should ever be active at a time.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app runs at `http://localhost:3000` and is pre-configured (via `.env`) to call the backend at `http://localhost:8080/api`.

### First Run Walkthrough

1. Navigate to `/register` and create an account.
2. Visit `/profile` to set travel preferences and favorite destinations.
3. Go to `/trips` → **New Trip** to create your first trip.
4. Open the trip and use **Trip Sharing** to invite another registered user by email.
5. Open the trip's itinerary view to add day-wise plans and activities.
6. Browse `/destinations` to explore the destination catalog.

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new traveler account |
| POST | `/api/auth/login` | Public | Authenticate, returns a JWT |

### User Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | JWT | Get current user's profile |
| PUT | `/api/users/me` | JWT | Update current user's profile |
| GET | `/api/users` | JWT (`ADMINISTRATOR`) | List all users |

### Trip Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/trips` | JWT | Create a trip |
| GET | `/api/trips` | JWT | List trips owned by or shared with the current user |
| GET | `/api/trips/{id}` | JWT | Get a single trip |
| PUT | `/api/trips/{id}` | JWT (owner) | Update a trip |
| DELETE | `/api/trips/{id}` | JWT (owner) | Delete a trip |
| POST | `/api/trips/{id}/travelers` | JWT (owner) | Share a trip with another user by email |

### Itinerary & Activities

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/trips/{tripId}/itineraries` | JWT (owner) | Add a day to a trip's itinerary |
| GET | `/api/trips/{tripId}/itineraries` | JWT (owner or shared traveler) | Get full itinerary for a trip |
| POST | `/api/trips/{tripId}/itineraries/{itineraryId}/activities` | JWT (owner) | Add an activity to a day |
| DELETE | `/api/trips/{tripId}/itineraries/{itineraryId}/activities/{activityId}` | JWT (owner) | Remove an activity |
| DELETE | `/api/trips/{tripId}/itineraries/{itineraryId}` | JWT (owner) | Remove a full itinerary day |

### Destinations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/destinations` | Public | List all destinations (optional `?country=` filter) |
| GET | `/api/destinations/{id}` | Public | Get a single destination |

All authenticated endpoints require an `Authorization: Bearer <token>` header, obtained from `/api/auth/login` or `/api/auth/register`.

---

## Roadmap

### Milestone 3 — Budget, Expenses & Collaboration (Next)
- Budget planning and category-wise expense tracking
- Expense reports and cost estimation
- Group travel creation, member invitations, shared expenses
- Trip and activity reminder notifications
- Travel document and photo upload

### Milestone 4 — Analytics, Testing & Deployment
- Traveler and admin analytics dashboards
- Unit and integration test coverage (JUnit, Mockito)
- Docker containerization
- Production deployment (PostgreSQL, AWS/Render/Railway)
- SSL configuration and monitoring/logging setup

---

## Contributing Notes

- Keep exactly one active database configuration block in `application.properties` at all times.
- New entities should follow the existing pattern: `model` → `repository` → `dto` → `service` → `controller`.
- Ownership and access-control checks belong in the service layer, not the controller.
- Run `mvn clean spring-boot:run` after any dependency-injection change to confirm the application context still starts cleanly.