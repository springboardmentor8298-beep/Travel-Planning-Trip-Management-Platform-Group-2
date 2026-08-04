# TripNest 🧳

> **A full-stack travel planning & trip management platform** built with React.js + Spring Boot.  
> Plan trips, build day-wise itineraries, track budgets, collaborate with friends, manage travel documents, and chat with your group — all in one place.

![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=flat&logo=spring&logoColor=white)
![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [User Roles](#user-roles)
8. [How to Run](#how-to-run)
9. [Milestone Progress](#milestone-progress)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based stateless authentication
- Role-based access control (Traveler / Agent / Admin)
- BCrypt password hashing
- Spring Security filter chain on all protected endpoints

### 🗺️ Trip Management
- Create, edit, delete, and view trips
- Trip fields: title, destination, dates, budget, status, number of travelers, description
- Trip status lifecycle: `PLANNED` → `ONGOING` → `COMPLETED` / `CANCELLED`
- Dashboard with trip stats (total, planned, ongoing, completed)

### 📅 Itinerary Planning
- Day-wise itinerary creation linked to trips
- Activity scheduling per day with 6 types:
  - 🏛️ Sightseeing &nbsp;|&nbsp; 🚗 Transport &nbsp;|&nbsp; 🏨 Accommodation
  - 🍽️ Dining &nbsp;|&nbsp; 🏄 Adventure &nbsp;|&nbsp; 🛍️ Shopping
- Activity details: name, description, location, start/end time, cost

### 🌍 Destination Discovery
- Pre-seeded directory of global travel destinations
- Browse and search by city or country name
- Destination detail modal: climate, best season, popular attractions

### 💰 Budget & Expense Tracking
- Per-trip budget allocation
- Expense recording with 6 categories: Transportation, Hotel, Food, Shopping, Entertainment, Miscellaneous
- Live budget summary: total spent, remaining balance, over-budget indicator
- Category-wise spending breakdown with progress bars

### 👥 Group Collaboration
- Invite collaborators to trips by username or email
- Invite lifecycle: Pending → Accepted / Declined
- Accepted members can view trip details and itineraries
- Remove members / leave trip actions

### 💬 Group Chat
- Per-trip message board visible to all members
- Date-grouped chat bubbles with sender avatars
- Auto-polls for new messages every 5 seconds

### 📁 Document Management
- Upload travel documents per trip (drag & drop supported)
- Supported types: Ticket, Hotel Booking, Passport, Visa, Photo, Other
- Files persisted in a Docker volume; downloadable from the UI
- Max file size: 10 MB

### 🔔 Notifications
- In-app notification bell in the navbar
- Types: Group Invite, Budget Alert, Trip Reminder, Activity Reminder, General
- Mark individual or all notifications as read
- Unread badge count, auto-polls every 30 seconds

### 🐳 Docker Deployment
- Full 3-container Docker Compose stack (DB + Backend + Frontend)
- Single-command deployment: `docker compose up --build`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Context API, Vanilla CSS |
| **Backend** | Java 21, Spring Boot 3.2, Spring Security, Spring Data JPA |
| **Database** | MySQL 8 (local/Docker), Hibernate ORM (ddl-auto=update) |
| **Authentication** | JWT (JJWT library), BCrypt |
| **File Storage** | Spring MultipartFile → local filesystem / Docker volume |
| **Build Tool** | Maven (backend), npm (frontend) |
| **Containerization** | Docker, Docker Compose |
| **Web Server** | Nginx (serves React build inside Docker) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose Stack                     │
│                                                             │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  tripnest-frontend│      │  tripnest-backend │            │
│  │  React + Nginx   │─────▶│  Spring Boot API  │            │
│  │  Port: 8081      │      │  Port: 8082       │            │
│  └──────────────────┘      └────────┬─────────┘            │
│                                     │                       │
│                            ┌────────▼─────────┐            │
│                            │   tripnest-db     │            │
│                            │   MySQL 8         │            │
│                            │   Port: 3307      │            │
│                            └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

Nginx proxies all `/api/**` requests from the frontend container to the backend container, so the browser only ever talks to port `8081`.

---

## 📁 Project Structure

```
TripNest/
├── tripnest/                          # Spring Boot Backend
│   ├── src/main/java/com/tripnest/
│   │   ├── controller/
│   │   │   ├── AuthController.java             # Login & Register
│   │   │   ├── TripController.java             # Trip CRUD & Stats
│   │   │   ├── ItineraryController.java        # Itinerary day management
│   │   │   ├── ActivityController.java         # Activity management
│   │   │   ├── DestinationController.java      # Global destination directory
│   │   │   ├── CollaborationController.java    # Trip members & invites
│   │   │   ├── ExpenseController.java          # Budget & expense tracking
│   │   │   ├── DocumentController.java         # Travel document upload
│   │   │   ├── GroupChatController.java        # Per-trip group chat
│   │   │   ├── NotificationController.java     # In-app notifications
│   │   │   └── GlobalExceptionHandler.java     # Structured error responses
│   │   ├── service/                            # Business logic layer
│   │   ├── repository/                         # Spring Data JPA interfaces
│   │   ├── entity/                             # JPA entities (11 tables)
│   │   ├── dto/                                # Request & Response DTOs
│   │   ├── security/                           # JWT filter chain & utilities
│   │   └── DataInitializer.java               # Seeds destinations on startup
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── tripnest-frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js / Register.js
│   │   │   ├── Navbar.js                       # Global nav + NotificationBell
│   │   │   ├── Dashboard.js                    # Stats overview + quick actions
│   │   │   ├── TripList.js                     # Searchable, filterable trip cards
│   │   │   ├── TripForm.js                     # Create / edit trip form
│   │   │   ├── TripDetail.js                   # Trip hub with 6 feature tabs
│   │   │   ├── ItineraryDay.js                 # Per-day activity management
│   │   │   ├── Destinations.js                 # Destination browser & detail modal
│   │   │   ├── TripMembers.js                  # Collaboration & invite UI
│   │   │   ├── BudgetOverview.js               # Budget summary & progress bars
│   │   │   ├── ExpenseList.js / ExpenseForm.js # Expense CRUD
│   │   │   ├── DocumentManager.js              # File upload & document list
│   │   │   ├── GroupChat.js                    # Group chat with polling
│   │   │   └── NotificationBell.js             # Navbar notification dropdown
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── trip.service.js
│   │   │   ├── collaboration.service.js
│   │   │   ├── expense.service.js
│   │   │   ├── document.service.js
│   │   │   └── notification.service.js
│   │   ├── context/AuthContext.js
│   │   ├── App.js                              # React Router configuration
│   │   └── App.css
│   ├── nginx.conf                              # Nginx proxy config for Docker
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── milestone_1_evaluation.html
├── milestone_2_documentation.html
├── milestone_3_documentation.html
└── README.md
```

---

## 🗄️ Database Schema

All tables are auto-created by Hibernate (`ddl-auto=update`):

| Table | Description |
|---|---|
| `users` | User accounts with username, email, phone, hashed password |
| `roles` | Application roles (`ROLE_TRAVELER`, `ROLE_AGENT`, `ROLE_ADMIN`) |
| `user_roles` | Junction table: users ↔ roles |
| `trips` | Trip records scoped to a user (title, destination, dates, budget, status) |
| `itineraries` | Day-wise plans linked to a trip (day number, date, notes) |
| `activities` | Scheduled events within a day (type, time, location, cost) |
| `destinations` | Pre-seeded global travel directory (climate, best season, attractions) |
| `trip_members` | Collaboration links (user → trip with PENDING / ACCEPTED / DECLINED status) |
| `expenses` | Financial transactions per trip (category, amount, date, recorder) |
| `travel_documents` | Uploaded file metadata per trip (type, filename, uploader, upload date) |
| `group_messages` | Per-trip chat messages (sender, message text, timestamp) |
| `notifications` | In-app notifications per user (type, title, message, read status) |

---

## 📡 API Reference

All endpoints except Auth and Destinations require a valid JWT in the `Authorization: Bearer <token>` header.

### Authentication (Public)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user account |
| `POST` | `/api/auth/signin` | Login and receive a JWT token |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips` | List all trips for the logged-in user |
| `POST` | `/api/trips` | Create a new trip |
| `GET` | `/api/trips/stats` | Dashboard stats (total, planned, ongoing, completed) |
| `GET` | `/api/trips/{id}` | Get trip details (owner + accepted members) |
| `PUT` | `/api/trips/{id}` | Edit a trip (owner only) |
| `DELETE` | `/api/trips/{id}` | Delete a trip and all its data |

### Itinerary Days
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips/{tid}/itineraries` | List all days for a trip |
| `POST` | `/api/trips/{tid}/itineraries` | Add a new day |
| `PUT` | `/api/trips/{tid}/itineraries/{id}` | Edit day notes or date |
| `DELETE` | `/api/trips/{tid}/itineraries/{id}` | Remove a day and its activities |

### Activities
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/itineraries/{iid}/activities` | List activities for a day |
| `POST` | `/api/itineraries/{iid}/activities` | Add an activity to a day |
| `PUT` | `/api/itineraries/{iid}/activities/{id}` | Edit activity details |
| `DELETE` | `/api/itineraries/{iid}/activities/{id}` | Remove an activity |

### Destinations (Public)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/destinations` | List all seeded destinations |
| `GET` | `/api/destinations/search?q={query}` | Search destinations by name or country |
| `GET` | `/api/destinations/{id}` | Full destination travel guide |

### Trip Members & Collaboration
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips/{tid}/members` | List all members and their status |
| `POST` | `/api/trips/{tid}/members/invite` | Invite a user by username or email |
| `PUT` | `/api/trips/{tid}/members/{id}/accept` | Accept an invitation |
| `PUT` | `/api/trips/{tid}/members/{id}/decline` | Decline an invitation |
| `DELETE` | `/api/trips/{tid}/members/{id}` | Remove a member / leave a trip |

### Budget & Expenses
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips/{tid}/expenses` | List all expenses for a trip |
| `GET` | `/api/trips/{tid}/expenses/summary` | Budget summary with category breakdown |
| `POST` | `/api/trips/{tid}/expenses` | Record a new expense |
| `PUT` | `/api/trips/{tid}/expenses/{id}` | Edit an expense (creator only) |
| `DELETE` | `/api/trips/{tid}/expenses/{id}` | Delete an expense (creator only) |

### Travel Documents
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips/{tid}/documents` | List all uploaded documents |
| `POST` | `/api/trips/{tid}/documents` | Upload a document (multipart, max 10 MB) |
| `GET` | `/api/trips/{tid}/documents/{id}/download` | Download a document file |
| `DELETE` | `/api/trips/{tid}/documents/{id}` | Delete a document (uploader only) |

### Group Chat
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips/{tid}/messages` | Fetch all chat messages for a trip |
| `POST` | `/api/trips/{tid}/messages` | Send a message to the group |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | List all notifications for the user |
| `GET` | `/api/notifications/unread-count` | Get unread notification count |
| `PUT` | `/api/notifications/{id}/read` | Mark a notification as read |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read |

---

## 👤 User Roles

| Role | Description |
|---|---|
| `ROLE_TRAVELER` | Default role for all registered users |
| `ROLE_AGENT` | Travel agents who manage trip packages |
| `ROLE_ADMIN` | Platform administrators with full access |

---

## 🚀 How to Run

### Method A: Docker Compose *(Recommended)*

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be running.

```bash
# Clone the repository
git clone https://github.com/your-username/TripNest.git
cd TripNest

# Build and start all containers
docker compose up --build
```

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:8081 |
| ⚙️ Backend API | http://localhost:8082/api |
| 🗄️ MySQL | localhost:3307 |

> Ports are offset from defaults (8080→8082, 3306→3307) to avoid conflicts with local dev servers.

**Subsequent rebuilds after code changes:**
```bash
docker compose build --no-cache backend frontend
docker compose up -d --no-deps backend frontend
```

---

### Method B: Manual Local Setup

#### Prerequisites
- Java 21+
- MySQL 8
- Node 18+
- Maven 3.9+

#### 1. Database
```sql
CREATE DATABASE tripnest_db;
```
Update credentials in `tripnest/src/main/resources/application.properties`.

#### 2. Backend
```bash
cd tripnest
./mvnw spring-boot:run
```
Starts on `http://localhost:8080`. Roles and destinations are seeded automatically on first startup.

#### 3. Frontend
```bash
cd tripnest-frontend
npm install
npm start
```
Starts on `http://localhost:3000`. Axios is pre-configured to proxy API requests to `localhost:8080`.

---

## 📊 Milestone Progress

| Milestone | Scope | Status |
|---|---|---|
| **M1** — Week 1–2 | JWT Auth, DB schema, RBAC, React skeleton | ✅ Complete |
| **M2** — Week 3–4 | Trip CRUD, itinerary planning, destinations, dashboard | ✅ Complete |
| **M3** — Week 5–6 | Budget & expenses, collaboration, group chat, documents, notifications, Docker | ✅ Complete |
| **M4** — Week 7–8 | Analytics dashboard, reports & charts, testing, cloud deployment | 🔲 Upcoming |

---

## 📄 Documentation

| Document | Description |
|---|---|
| [`milestone_1_evaluation.html`](milestone_1_evaluation.html) | M1 evaluation report — Auth & Security |
| [`milestone_2_documentation.html`](milestone_2_documentation.html) | M2 technical documentation — Trip & Itinerary |
| [`milestone_3_documentation.html`](milestone_3_documentation.html) | M3 technical documentation — Budget, Collaboration & Docker |

---

<p align="center">Built with ☕ Java + ⚛️ React</p>


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
   *(Note: Host ports are configured as: DB: `3307`, Backend: `8082`, Frontend: `8081` to prevent port conflicts with local dev servers).*

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
The server will start on `http://localhost:8080` (seeds roles and destinations automatically on first startup).

#### 3. Frontend Startup
```bash
cd tripnest-frontend
npm install
npm start
```
The development server will start on `http://localhost:3000` (automatically proxies requests to `8080`).
