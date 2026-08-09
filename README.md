# TripNest 🧳✈️

> **TripNest: Travel Planning & Trip Management Platform**
> A full-stack web application (React.js frontend + Spring Boot backend) that enables travelers to plan trips, create day-wise itineraries, manage travel budgets, collaborate with friends and family, track expenses, and organize travel documents — all through a centralized travel dashboard.

[![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=flat&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)

---

## 📋 Table of Contents

1. [Objective](#objective)
2. [Features by Milestone](#features-by-milestone)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [User Roles](#user-roles)
9. [How to Run](#how-to-run)
10. [Milestone Progress & Evaluation](#milestone-progress--evaluation)

---

<a id="objective"></a>
## 🎯 Objective

Build a full-stack web application (React.js frontend + Spring Boot backend) that enables travelers to:

- 🗺️ **Plan trips** with day-wise itineraries and activity scheduling
- 💰 **Manage budgets** and track expenses across categories
- 👥 **Collaborate** with friends and family on shared trip plans
- 📁 **Organize travel documents** (tickets, visas, hotel bookings, photos)
- 🔔 **Stay notified** with trip reminders, budget alerts, and group invitations
- 🌍 **Discover destinations** with curated travel guides and attraction listings

---

<a id="features-by-milestone"></a>
## ✨ Features by Milestone

### ✅ Milestone 1 — Authentication & Backend Setup (Week 1-2)

#### 🔐 User Authentication & Role-Based Access
- JWT-based stateless authentication (no server-side session)
- BCrypt password hashing
- Role-based access control: **Traveler**, **Agent**, **Administrator**
- Spring Security filter chain protecting all private endpoints
- Automatic role and destination seeding on first startup

#### 🗄️ Database Design
Complete schema with 12 tables auto-created by Hibernate:
`users` · `roles` · `user_roles` · `trips` · `itineraries` · `activities` · `destinations` · `trip_members` · `expenses` · `travel_documents` · `group_messages` · `notifications`

---

### ✅ Milestone 2 — Trip & Itinerary Management (Week 3-4)

#### ✈️ Trip Management System
- Create, edit, view, and delete trips
- Trip fields: title, destination, start/end dates, budget, number of travelers, description
- Trip status lifecycle: `PLANNED` → `ONGOING` → `COMPLETED` / `CANCELLED`
- Dashboard with trip statistics (total, planned, ongoing, completed)

#### 📅 Itinerary Planning System
- Day-wise itinerary creation linked to trips
- Activity scheduling with 6 types: Sightseeing, Transportation, Accommodation, Dining, Adventure, Shopping
- Activity details: name, description, location, start/end time, cost

#### 🌍 Destination Discovery
- Pre-seeded directory of 20+ global travel destinations
- Browse and search by city or country name
- Destination detail modal with climate, best season, and popular attractions

---

### ✅ Milestone 3 — Budget, Expenses, Collaboration & Deployment (Week 5-6)

#### 💰 Budget & Expense Management
- Per-trip budget allocation with real-time remaining balance
- Expense recording with 6 categories: Transportation, Hotel, Food, Shopping, Entertainment, Miscellaneous
- Live budget summary with over-budget indicator
- Category-wise spending breakdown with progress bars

#### 👥 Group Collaboration System
- Invite collaborators by username or email
- Invite lifecycle: Pending → Accepted / Declined
- Accepted members can view trip details, itinerary, expenses, chat, and documents
- Trip owner can remove members; members can leave trips

#### 💬 Group Chat (Discussion)
- Per-trip message board visible to all accepted members
- Date-grouped chat bubbles with sender avatars
- Auto-polls for new messages every 5 seconds

#### 📁 Media & Document Management
- Upload travel documents per trip: Ticket, Hotel Booking, Passport, Visa, Photo, Other
- Files stored in Docker named volume — persist across container restarts
- Authenticated file streaming (view in browser / download) — JWT required
- Max file size: 10 MB

#### 🔔 Notification System
- In-app notification bell with unread count badge
- Types: Group Invite, Budget Alert, Trip Reminder, Activity Reminder, General
- Mark individual or all notifications as read
- Auto-polls every 30 seconds

#### 🐳 Docker Containerization & Deployment
- 3-container Docker Compose stack: MySQL + Spring Boot + React/Nginx
- Named Docker volumes for MySQL data and uploaded files (persistent)
- Single-command deployment: `docker compose up --build`
- Swagger UI / OpenAPI docs at `/swagger-ui.html`

---

<a id="tech-stack"></a>
## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Context API, Vanilla CSS |
| **Backend** | Java 21, Spring Boot 3.2, Spring Security, Spring Data JPA, Hibernate |
| **Database** | MySQL 8 (development/Docker), PostgreSQL (production) |
| **Authentication** | JWT (JJWT 0.11.5), BCrypt |
| **API Documentation** | SpringDoc OpenAPI 2.3 (Swagger UI) |
| **File Storage** | Spring MultipartFile → local filesystem / Docker named volume |
| **Build Tools** | Maven 3.9 (backend), npm (frontend) |
| **Containerization** | Docker, Docker Compose |
| **Web Server** | Nginx 1.25 (serves React build, proxies /api to backend) |
| **Testing** | Postman (30+ request collection with auto JWT capture) |

---

<a id="architecture"></a>
## 🏗️ Architecture

```
+-------------------------------------------------------------+
|                     Docker Compose Stack                     |
|                                                             |
|  +------------------+      +------------------+            |
|  | tripnest-frontend|      | tripnest-backend  |            |
|  | React + Nginx    |----->| Spring Boot API   |            |
|  | Port: 8081       |      | Port: 8082        |            |
|  +------------------+      +--------+---------+            |
|                                     |                       |
|                            +--------v---------+            |
|                            |   tripnest-db     |            |
|                            |   MySQL 8         |            |
|                            |   Port: 3307      |            |
|                            +------------------+            |
|                                                             |
|  Named Volumes: db_data (MySQL) + uploads_data (Files)     |
+-------------------------------------------------------------+
```

Nginx proxies all `/api/**` requests from the frontend to the backend container so the browser only communicates via port `8081`.

---

<a id="project-structure"></a>
## 📁 Project Structure

```
TripNest/
├── tripnest/                          # Spring Boot Backend
│   ├── src/main/java/com/tripnest/
│   │   ├── controller/
│   │   │   ├── AuthController.java             # Login & Register
│   │   │   ├── TripController.java             # Trip CRUD & Stats
│   │   │   ├── ItineraryController.java        # Day management
│   │   │   ├── ActivityController.java         # Activity scheduling
│   │   │   ├── DestinationController.java      # Destination directory
│   │   │   ├── CollaborationController.java    # Members & invitations
│   │   │   ├── ExpenseController.java          # Budget & expenses
│   │   │   ├── DocumentController.java         # Document upload/download
│   │   │   ├── GroupChatController.java        # Group chat
│   │   │   ├── NotificationController.java     # Notifications
│   │   │   └── GlobalExceptionHandler.java     # Error handling
│   │   ├── service/                            # Business logic
│   │   ├── repository/                         # JPA repositories
│   │   ├── entity/                             # JPA entities (12 tables)
│   │   ├── dto/                                # Request & Response DTOs
│   │   ├── security/                           # JWT + Spring Security config
│   │   └── DataInitializer.java               # Seeds roles & destinations
│   ├── src/main/resources/application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── tripnest-frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js / Register.js
│   │   │   ├── Navbar.js                       # Profile dropdown + notifications
│   │   │   ├── Dashboard.js                    # Stats overview
│   │   │   ├── TripList.js / TripForm.js / TripDetail.js
│   │   │   ├── ItineraryDay.js                 # Per-day activities
│   │   │   ├── Destinations.js                 # Destination browser
│   │   │   ├── TripMembers.js                  # Collaboration UI
│   │   │   ├── BudgetOverview.js               # Budget summary
│   │   │   ├── ExpenseList.js / ExpenseForm.js
│   │   │   ├── DocumentManager.js              # File upload & download
│   │   │   ├── GroupChat.js                    # Group chat
│   │   │   └── NotificationBell.js             # Notification dropdown
│   │   ├── services/                           # API service layer
│   │   ├── context/AuthContext.js              # Auth state management
│   │   ├── App.js                              # Route configuration
│   │   └── App.css                             # Design system
│   ├── nginx.conf                              # Nginx proxy config
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml                 # 3-container orchestration
├── TripNest.postman_collection.json   # Complete API test collection
└── README.md
```

---

<a id="database-schema"></a>
## 🗄️ Database Schema

All 12 tables auto-created by Hibernate (`ddl-auto=update`):

| Table | Description |
|---|---|
| `users` | Accounts: username, email, phone, hashed password, firstName, lastName |
| `roles` | Roles: ROLE_TRAVELER, ROLE_AGENT, ROLE_ADMIN |
| `user_roles` | Junction: users ↔ roles |
| `trips` | Trip records: title, destination, dates, budget, status, travelers |
| `itineraries` | Day-wise plans: day number, date, notes |
| `activities` | Scheduled events: type, time, location, cost, description |
| `destinations` | Pre-seeded global directory: climate, best season, attractions |
| `trip_members` | Collaboration: user→trip with PENDING/ACCEPTED/DECLINED status |
| `expenses` | Financial records: category, amount, date, recorder |
| `travel_documents` | File metadata: type, filename, path, uploader, upload date |
| `group_messages` | Chat messages: sender, text, timestamp |
| `notifications` | Alerts: type, title, message, read status, timestamp |

---

<a id="api-reference"></a>
## 📡 API Reference

All endpoints except Auth and Destinations require `Authorization: Bearer <token>`.

> Interactive docs: **`http://localhost:8082/swagger-ui.html`**

### Authentication (Public)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Login, receive JWT |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips` | List all trips (owned + collaborations) |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips/stats` | Dashboard statistics |
| GET | `/api/trips/{id}` | Get trip details |
| PUT | `/api/trips/{id}` | Edit trip (owner only) |
| DELETE | `/api/trips/{id}` | Delete trip |

### Itinerary Days
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/{tid}/itineraries` | List all days |
| POST | `/api/trips/{tid}/itineraries` | Add a day |
| PUT | `/api/trips/{tid}/itineraries/{id}` | Edit a day |
| DELETE | `/api/trips/{tid}/itineraries/{id}` | Delete a day |

### Activities
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/itineraries/{iid}/activities` | List activities |
| POST | `/api/itineraries/{iid}/activities` | Add activity |
| PUT | `/api/itineraries/{iid}/activities/{id}` | Edit activity |
| DELETE | `/api/itineraries/{iid}/activities/{id}` | Delete activity |

### Destinations (Public)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/destinations` | List all destinations |
| GET | `/api/destinations/search?q={query}` | Search destinations |
| GET | `/api/destinations/{id}` | Get destination guide |

### Group Collaboration
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/{tid}/members` | List all members |
| POST | `/api/trips/{tid}/members/invite` | Invite user |
| PUT | `/api/trips/{tid}/members/{id}/accept` | Accept invitation |
| PUT | `/api/trips/{tid}/members/{id}/decline` | Decline invitation |
| DELETE | `/api/trips/{tid}/members/{id}` | Remove / leave |

### Budget & Expenses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/{tid}/expenses` | List expenses |
| GET | `/api/trips/{tid}/expenses/summary` | Budget summary |
| POST | `/api/trips/{tid}/expenses` | Record expense |
| PUT | `/api/trips/{tid}/expenses/{id}` | Edit expense |
| DELETE | `/api/trips/{tid}/expenses/{id}` | Delete expense |

### Travel Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/{tid}/documents` | List documents |
| POST | `/api/trips/{tid}/documents/upload` | Upload document (max 10MB) |
| GET | `/api/trips/{tid}/documents/{id}/view` | View document (authenticated) |
| GET | `/api/trips/{tid}/documents/{id}/download` | Download document |
| DELETE | `/api/trips/{tid}/documents/{id}` | Delete document |

### Group Chat
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/{tid}/messages` | Get all messages |
| POST | `/api/trips/{tid}/messages` | Send message |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

---

<a id="user-roles"></a>
## 👤 User Roles

| Role | Description |
|---|---|
| `ROLE_TRAVELER` | Default — registered users who plan and manage trips |
| `ROLE_AGENT` | Travel agents who manage trip packages |
| `ROLE_ADMIN` | Platform administrators with full access |

---

<a id="how-to-run"></a>
## 🚀 How to Run

### Method A: Docker Compose *(Recommended)*

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) running.

```bash
git clone https://github.com/vadagammanikanta/TripNest.git
cd TripNest
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend App | http://localhost:8081 |
| Backend API | http://localhost:8082/api |
| Swagger UI | http://localhost:8082/swagger-ui.html |
| MySQL | localhost:3307 |

**Rebuild after changes:**
```bash
docker compose up --build -d
```

### Method B: Manual Local Development

**Prerequisites:** Java 21+, MySQL 8, Node.js 18+, Maven 3.9+

```sql
-- 1. Create database
CREATE DATABASE tripnest_db;
```

```bash
# 2. Start backend (http://localhost:8080)
cd tripnest
./mvnw spring-boot:run

# 3. Start frontend (http://localhost:3000)
cd tripnest-frontend
npm install && npm start
```

**Test with Postman:** Import `TripNest.postman_collection.json` — Login auto-captures JWT into `{{token}}`.

---

### Analytics & Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/user` | Fetch interactive spending & travel analytics |
| GET | `/api/trips/{id}/export/pdf` | Export trip itinerary & expenses as PDF document |

---

<a id="milestone-progress--evaluation"></a>
## 📊 Milestone Progress & Evaluation

| Milestone | Week | Scope | Status |
|---|---|---|---|
| **M1** | Week 1-2 | Requirements, DB Design & Backend Setup | ✅ Complete |
| **M2** | Week 3-4 | Trip & Itinerary Management | ✅ Complete |
| **M3** | Week 5-6 | Budget, Expenses & Collaboration | ✅ Complete |
| **M4** | Week 7-8 | Analytics, Testing & Cloud Deployment | ✅ Complete |

### Milestone 1 Evaluation Criteria ✅
- [x] Spring Boot project setup completed
- [x] JWT authentication implemented and functional
- [x] Database schema finalized (12 tables)
- [x] React frontend authentication flow working
- [x] Role-based access configured (Traveler / Agent / Admin)

### Milestone 2 Evaluation Criteria ✅
- [x] Trip management operational (full CRUD + status lifecycle)
- [x] Itinerary planning functional (day-wise + activity scheduling)
- [x] Destination pages implemented (20+ seeded destinations, search)

### Milestone 3 Evaluation Criteria ✅
- [x] Budget management operational (allocation + real-time balance)
- [x] Expense tracking functional (6 categories + category breakdown)
- [x] Group collaboration workflow complete (invite → accept → collaborate)
- [x] Group chat per trip (real-time polling)
- [x] Document upload/view/download (authenticated streaming, Docker volume persistence)
- [x] In-app notification system (bell, unread badge, mark read)
- [x] Full Docker Compose deployment with persistent named volumes
- [x] Swagger UI / OpenAPI documentation
- [x] Complete Postman test collection (30+ requests, auto JWT capture)

### Milestone 4 Evaluation Criteria ✅
- [x] Analytics & reporting dashboard operational with Chart.js (Doughnut, Bar, and Line charts)
- [x] One-click PDF Itinerary & Expense Summary export (`/api/trips/{id}/export/pdf`)
- [x] Comprehensive backend unit test suite using JUnit 5 & Mockito (`mvn test`)
- [x] React component test suite using React Testing Library (`npm test`)
- [x] Production environment profile setup (`application-prod.properties`) for PostgreSQL & cloud deployment

---

<p align="center">Built with ☕ Java 21 + ⚛️ React 18 | TripNest © 2026</p>

