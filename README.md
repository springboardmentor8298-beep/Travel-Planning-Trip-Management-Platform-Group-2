# TripNest 🧳

A full-stack travel planning and trip management platform with JWT authentication, role-based access control, interactive itineraries, activity planning, and a destination directory.

---

## 1. Project Structure

```
TripNest/
├── tripnest/               # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/tripnest/
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   │   ├── AuthController.java      (Authentication APIs)
│   │   │   │   │   ├── TripController.java      (Trip CRUD & Stats)
│   │   │   │   │   ├── ItineraryController.java (Itinerary Days CRUD)
│   │   │   │   │   ├── ActivityController.java  (Activities CRUD)
│   │   │   │   │   └── DestinationController.js (Global seeded destinations)
│   │   │   │   ├── dto/             # Request/Response DTOs
│   │   │   │   ├── entity/          # JPA Entities (User, Role, Trip, Itinerary, Activity, Destination)
│   │   │   │   ├── repository/      # Spring Data JPA interfaces
│   │   │   │   ├── security/        # JWT security filter chain configuration
│   │   │   │   └── DataInitializer.java (Seeding destinations on startup)
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── data.sql         (Seeding roles)
│   └── pom.xml
│
├── tripnest-frontend/      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Navbar.js
│   │   │   ├── Dashboard.js         (Stats & Actions overview)
│   │   │   ├── TripList.js          (Search, filter & view trips)
│   │   │   ├── TripForm.js          (Plan/Edit trips)
│   │   │   ├── TripDetail.js        (View trip & manage days)
│   │   │   ├── ItineraryDay.js      (Manage activities per day)
│   │   │   └── Destinations.js      (Search & view seeded destinations)
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   └── trip.service.js      (All travel planning API integrations)
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js                   (React routes configuration)
│   │   ├── App.css                  (Clean layout custom styles)
│   │   └── index.js
│   └── package.json
│
├── Milestone_2_Documentation.md  (Detailed documentation of Milestone 2 architecture)
├── docker-compose.yml       (Docker Compose full-stack file)
└── README.md
```

---

## 2. User Roles

| Role           | Description                              |
|----------------|------------------------------------------|
| ROLE_TRAVELER  | Default — registered users/travelers     |
| ROLE_AGENT     | Travel agents who manage packages        |
| ROLE_ADMIN     | Platform administrators (full access)    |

---

## 3. Database Schema

Tables auto-created by Hibernate (`ddl-auto=update`):

- **users**: Main user table containing username, email, phone, and hashed password.
- **roles**: Stores application roles (`ROLE_TRAVELER`, `ROLE_AGENT`, `ROLE_ADMIN`).
- **user_roles**: Junction table mapping users to roles.
- **trips**: Stores trip title, destination, dates, budget, status, and number of travelers (linked to `users`).
- **itineraries**: Represents distinct daily plans within a trip (linked to `trips`).
- **activities**: Specific events (sightseeing, dining, transport, shopping, adventure, accommodation) within a day (linked to `itineraries`).
- **destinations**: Pre-seeded database of global travel spots with climate, best season, and attractions.

---

## 4. API Endpoints

### Authentication (Public)
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| POST   | /api/auth/signup      | Register new user      |
| POST   | /api/auth/signin      | Login, receive JWT     |

### Travel Planning (JWT Protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/trips | List logged-in user's trips |
| POST | /api/trips | Create a new trip |
| GET | /api/trips/stats | Retrieve stats count for dashboard |
| GET | /api/trips/{id} | Get detailed trip profile |
| PUT | /api/trips/{id} | Edit a trip |
| DELETE | /api/trips/{id} | Delete a trip, itinerary, and activities |
| POST | /api/trips/{tid}/itineraries | Add an itinerary day |
| DELETE | /api/trips/{tid}/itineraries/{id} | Delete a day |
| POST | /api/itineraries/{iid}/activities | Add an activity to a day |
| DELETE | /api/itineraries/{iid}/activities/{id} | Remove an activity |

### Destinations (Public)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/destinations | List pre-seeded destinations |
| GET | /api/destinations/search?q={query} | Search by name or country |
| GET | /api/destinations/{id} | Fetch destination travel guide details |

---

## 5. How to Setup & Run

### Method A: Docker Compose (Quickest)
Requires Docker Desktop to be running.
1. Run:
   ```bash
   docker-compose up --build
   ```
2. View the application at: **`http://localhost:8081`**
   *(Note: Host ports are configured as: DB: `3307`, Backend: `8085`, Frontend: `8081` to prevent port conflicts with local dev servers).*

---

### Method B: Manual Startup

#### Prerequisites
- Java 21
- MySQL 8
- Node 18+

#### 1. Database Setup
Create MySQL database:
```sql
CREATE DATABASE tripnest_db;
```
Configure your database connection credentials in `tripnest/src/main/resources/application.properties`.

#### 2. Backend Startup
```bash
cd tripnest
./mvnw spring-boot:run
```
The server will start on `http://localhost:8085` (seeds roles and destinations automatically on first startup).

#### 3. Frontend Startup
```bash
cd tripnest-frontend
npm install
npm start
```
The development server will start on `http://localhost:3000` (automatically proxies requests to `8085`).
