# 🌍 TripNest — Travel Planning & Trip Management Platform

<div align="center">

![TripNest Banner](https://img.shields.io/badge/TripNest-AI%20Powered%20Travel%20Platform-10b981?style=for-the-badge&logo=google-maps&logoColor=white)

**Plan smarter. Travel better. Collaborate effortlessly.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-trip--nest--sand.vercel.app-10b981?style=for-the-badge)](https://trip-nest-sand.vercel.app)
[![Backend API](https://img.shields.io/badge/⚙️_Backend_API-Render-46E3B7?style=for-the-badge)](https://tripnest-backend-4epj.onrender.com)

---

[![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=flat&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=white)](https://render.com/)
[![Groq AI](https://img.shields.io/badge/Groq_LLaMA_3.3-F55036?style=flat&logo=meta&logoColor=white)](https://groq.com/)

</div>

---

## 🔗 Live Demo

| Service | Link |
|---|---|
| 🌐 **Live Application** | **[https://trip-nest-sand.vercel.app](https://trip-nest-sand.vercel.app)** |
| ⚙️ **REST API** | [https://tripnest-backend-4epj.onrender.com](https://tripnest-backend-4epj.onrender.com) |
| 📦 **Personal GitHub** | [github.com/vadagammanikanta/TripNest](https://github.com/vadagammanikanta/TripNest) |
| 🏫 **Mentor GitHub** | [Travel-Planning-Trip-Management-Platform-Group-2](https://github.com/springboardmentor8298-beep/Travel-Planning-Trip-Management-Platform-Group-2/tree/V-S-S-S-MANIKANTA) |

> ⚠️ The backend is hosted on Render's free tier and may take ~30 seconds to wake up on the first request.

---

## 📋 Table of Contents

1. [Objective](#objective)
2. [Modules Implemented](#modules-implemented)
3. [Week-wise Milestone Progress](#milestone-progress)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Project Structure](#project-structure)
7. [Evaluation Criteria](#evaluation-criteria)
8. [Performance Metrics](#performance-metrics)
9. [Running Locally](#running-locally)

---

## 🎯 Objective

Build a full-stack web application (React.js frontend + Spring Boot backend) that enables travelers to:

- 🗺️ **Plan trips** with day-wise itineraries and activity scheduling
- 💰 **Manage budgets** and track expenses across categories
- 👥 **Collaborate** with friends and family on shared trip plans
- 📁 **Organize travel documents** (tickets, visas, hotel bookings, photos)
- 🔔 **Stay notified** with trip reminders, budget alerts, and group invitations
- 🌍 **Discover destinations** with curated travel guides and attraction listings
- 🤖 **Get AI-powered travel guidance** via an integrated Tourist Guide Agent

### ✅ Outcomes Achieved

- ✅ Developed and deployed a full-stack React.js + Spring Boot application
- ✅ Implemented secure user authentication using JWT and OAuth2 (Google)
- ✅ Built trip creation and itinerary management functionality
- ✅ Implemented budget and expense tracking systems
- ✅ Added collaborative trip planning and group management
- ✅ Created dashboards for trip analytics and expense reports
- ✅ Integrated maps (Leaflet.js) and location services (Open-Meteo Weather API)
- ✅ Deployed frontend (Vercel) and backend (Render) with TiDB cloud database
- ✅ Added notifications for trip reminders and travel updates
- ✅ Integrated AI Tourist Guide powered by Groq LLaMA 3.3 70B

---

## 🧩 Modules Implemented

### 1. 🔐 User Authentication & Role-Based Access
- ✅ JWT Authentication (Stateless, access tokens)
- ✅ Google OAuth2 Login (Google Identity Services SDK)
- ✅ Password Reset via email token
- ✅ Profile Management with avatar upload
- ✅ **Roles:** Traveler, Group Admin, Administrator

### 2. 👤 User Profile Management
- ✅ Profile creation and editing
- ✅ Travel preferences and favorite destinations
- ✅ Account settings and password change
- ✅ Travel history (completed trips)
- ✅ Profile customization

### 3. 🗺️ Trip Management System
- ✅ Create, Edit, Delete trips
- ✅ View trip details with full timeline
- ✅ Trip sharing via unique public token
- ✅ Trip Information: Destination, Start/End Date, Travelers, Budget, Status

### 4. 📅 Itinerary Planning System
- ✅ Day-wise itinerary creation
- ✅ Activity scheduling with types:
  - Sightseeing, Transportation, Accommodation, Dining, Adventure, Shopping
- ✅ Place management and travel timeline
- ✅ Activity reminders via notification system

### 5. 💰 Budget & Expense Management
- ✅ Budget planning per trip
- ✅ Expense recording with category tagging
- ✅ Category-wise expenses: Transportation, Hotel, Food, Shopping, Entertainment, Miscellaneous
- ✅ Cost estimation and budget gauge widget
- ✅ Expense reports with pie charts and bar graphs
- ✅ **Group Expense Splitting** — auto-split bills among trip members

### 6. 👥 Group Collaboration System
- ✅ Create travel groups / invite members by email or username
- ✅ Shared itineraries
- ✅ **Real-time Group Chat** per trip
- ✅ Shared expenses with split management
- ✅ Role management (Owner, Editor, Viewer)

### 7. 🌍 Destination Discovery System
- ✅ Browse and search destinations
- ✅ Destination details and attraction listings
- ✅ Travel guides via AI Tourist Agent
- ✅ Live Weather information (Open-Meteo API)
- ✅ Interactive map with location markers (Leaflet.js)

### 8. 📁 Media & Document Management
- ✅ Upload travel documents (PDF, images)
- ✅ Upload tickets, hotel bookings, visas
- ✅ Trip PDF export (complete summary)
- ✅ Secure cloud-compatible document storage

### 9. 🔔 Notification System
- ✅ Trip reminders and activity reminders
- ✅ Budget alerts (when spending exceeds thresholds)
- ✅ Group invitations
- ✅ System notifications with in-app bell indicator
- ✅ Mark all/individual notifications as read

### 10. 📊 Reports & Analytics

#### Traveler Dashboard
- ✅ Upcoming trips overview
- ✅ Budget overview with gauge chart
- ✅ Expense summary with visual breakdown
- ✅ Travel statistics (trips completed, total spend, destinations)
- ✅ Favorite destinations

#### Admin Dashboard
- ✅ User analytics (total users, active users)
- ✅ Trip analytics (trips created, destinations)
- ✅ Platform statistics and activity logs

### 11. 💳 Payment Management
- ✅ Group expense splitting
- ✅ Shared expense tracking
- ✅ Settlement management (who owes what to whom)

### 12. 🤖 AI Tourist Guide (Bonus Feature)
- ✅ Integrated Groq Cloud AI (LLaMA 3.3 70B Versatile model)
- ✅ Aware of live trip details, budget, weather, and all user trips
- ✅ Provides tourist recommendations, food guides, packing tips
- ✅ Floating agent widget accessible on every screen

### 13. ☁️ Final Integration, Testing & Deployment
- ✅ Frontend and backend integration
- ✅ API validation and Postman testing
- ✅ Security testing (JWT, CORS, input validation)
- ✅ Docker containerization (docker-compose)
- ✅ Production deployment (Vercel + Render + TiDB)

---

## 📅 Week-wise Milestone Progress

### ✅ Milestone 1 — Week 1 & 2: Requirements, Database Design & Backend Setup

| Task | Status |
|---|---|
| Define project scope and user roles | ✅ Done |
| Design database schema (Users, Roles, Trips, Itineraries, Activities, Destinations, Budgets, Expenses, Notifications) | ✅ Done |
| Initialize Spring Boot project | ✅ Done |
| Configure MySQL database | ✅ Done |
| Implement JWT authentication | ✅ Done |
| Create React frontend skeleton | ✅ Done |

**Outcomes:**
- ✅ Backend and frontend architecture setup completed
- ✅ Authentication flow functional (JWT + Google OAuth2)
- ✅ Database schema finalized with all entities
- ✅ Role-based access configured (Traveler / Admin)

---

### ✅ Milestone 2 — Week 3 & 4: Trip & Itinerary Management

| Task | Status |
|---|---|
| Implement trip management APIs | ✅ Done |
| Build itinerary creation functionality | ✅ Done |
| Develop destination pages | ✅ Done |
| Create trip dashboards | ✅ Done |
| Implement activity scheduling | ✅ Done |

**Outcomes:**
- ✅ Trip management operational (Create, Edit, Delete, Share)
- ✅ Itinerary workflow functional (day-wise, activity types)
- ✅ Destination management completed

---

### ✅ Milestone 3 — Week 5 & 6: Budget, Expenses & Collaboration

| Task | Status |
|---|---|
| Implement budget management system | ✅ Done |
| Build expense tracking functionality | ✅ Done |
| Create group collaboration workflow | ✅ Done |
| Implement notifications | ✅ Done |
| Add document upload system | ✅ Done |

**Outcomes:**
- ✅ Expense management operational (category-wise, CSV/PDF export)
- ✅ Group collaboration functional (invite, chat, shared expenses)
- ✅ Budget tracking completed with alerts
- ✅ Group Expense Splitting with settlement views

---

### ✅ Milestone 4 — Week 7 & 8: Analytics, Testing & Deployment

| Task | Status |
|---|---|
| Build analytics dashboard | ✅ Done |
| Add reports and charts | ✅ Done |
| Implement testing and validations | ✅ Done |
| Deploy frontend (Vercel) + backend (Render) | ✅ Done |
| Configure production environment with TiDB | ✅ Done |
| Add AI Tourist Guide (Groq LLaMA 3.3) | ✅ Done (Bonus) |
| Add Google OAuth2 Sign-In | ✅ Done (Bonus) |
| Add Dark Mode / Light Mode | ✅ Done (Bonus) |
| Docker containerization | ✅ Done |

**Outcomes:**
- ✅ Fully deployed production-ready application at [trip-nest-sand.vercel.app](https://trip-nest-sand.vercel.app)
- ✅ Analytics and reporting systems operational
- ✅ Complete end-to-end travel planning workflow demonstrable

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                           │
│          React SPA (Vercel CDN — trip-nest-sand.vercel.app) │
└──────────────────────┬──────────────────────────────────────┘
                       │  /api/* requests proxied via vercel.json
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          Spring Boot REST API (Render Free Tier)            │
│           tripnest-backend-4epj.onrender.com                │
│  - Spring Security + JWT                                    │
│  - Google OAuth2 endpoint                                   │
│  - JPA Repositories + Hibernate (MySQL Dialect)             │
└──────────────────────┬──────────────────────────────────────┘
                       │ JDBC + TLS (sslMode=VERIFY_IDENTITY)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           TiDB Serverless (MySQL-compatible cloud DB)       │
│         gateway01.ap-southeast-1.prod.aws.tidbcloud.com     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Axios |
| **Styling** | Vanilla CSS, Custom Design System, Dark/Light Mode |
| **Maps** | Leaflet.js + OpenStreetMap |
| **Charts** | Chart.js (Pie, Bar, Doughnut) |
| **Backend** | Spring Boot 3.2, Spring Security, Spring Data JPA |
| **Authentication** | JWT (JJWT), Google OAuth 2.0 |
| **Database (Local)** | MySQL 8 |
| **Database (Cloud)** | TiDB Serverless (MySQL-compatible) |
| **AI** | Groq Cloud API — LLaMA 3.3 70B Versatile |
| **Weather API** | Open-Meteo (free, no key required) |
| **Containerization** | Docker, Docker Compose |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |

---

## 📁 Project Structure

```
TripNest/
├── tripnest/                              # Spring Boot Backend
│   ├── src/main/java/com/tripnest/
│   │   ├── controller/                   # REST API Controllers
│   │   ├── service/                      # Business Logic Layer
│   │   ├── repository/                   # Spring Data JPA Repositories
│   │   ├── model/                        # JPA Entity Classes
│   │   ├── security/                     # JWT + Spring Security Config
│   │   └── dto/                          # Request/Response DTOs
│   └── Dockerfile
│
├── tripnest-frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/                   # Page Components
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js / Register.js
│   │   │   ├── TripDetail.js
│   │   │   ├── AnalyticsDashboard.js
│   │   │   ├── GroupChat.js
│   │   │   ├── AiAssistant.js
│   │   │   ├── WeatherWidget.js
│   │   │   ├── TripMap.js
│   │   │   └── AdminDashboard.js
│   │   ├── context/                      # Auth + Theme Context (React Context API)
│   │   ├── services/                     # Axios API Service Modules
│   │   └── index.css                     # Global Design System
│   ├── vercel.json                       # Vercel proxy → Render backend
│   ├── nginx.conf                        # Nginx SPA config (Docker)
│   └── Dockerfile
│
├── docker-compose.yml                    # Local Docker stack
├── docker-compose.prod.yml               # Production Docker stack
├── TripNest.postman_collection.json      # Postman API collection
└── README.md
```

---

## 🎯 Evaluation Criteria

### ✅ Milestone 1 (Week 2)
- ✅ Spring Boot project setup completed
- ✅ JWT authentication implemented
- ✅ Database schema finalized
- ✅ Frontend authentication flow working (Login + Register + Google OAuth)

### ✅ Milestone 2 (Week 4)
- ✅ Trip management operational (CRUD, sharing, timeline)
- ✅ Itinerary planning functional (day-wise, activity types)
- ✅ Destination pages implemented

### ✅ Milestone 3 (Week 6)
- ✅ Budget management operational (planning, alerts, gauge)
- ✅ Expense tracking functional (categories, summary)
- ✅ Collaboration workflow completed (invite, chat, split expenses)

### ✅ Milestone 4 (Week 8)
- ✅ Fully deployed frontend and backend
- ✅ Analytics and reporting systems operational
- ✅ End-to-end travel planning workflow demonstrated
- ✅ Docker containerization complete
- ✅ AI Tourist Guide (Bonus)
- ✅ Google OAuth2 (Bonus)

---

## 📊 Performance Metrics

### Trip Management Metrics
- Trip creation success rate: **100%** (validated CRUD flow)
- Itinerary completion rate: **Day-wise activity management fully functional**
- Destination engagement: **Maps + AI Guide + Weather integrated**
- Group collaboration: **Invite, chat, shared expense splitting**

### Budget & Expense Metrics
- Expense tracking accuracy: **Category-wise with visual reports**
- Budget utilization: **Real-time gauge and alerts**
- Shared expense settlement: **Auto-split among trip members**

### System Performance Metrics
- API response time: **< 500ms on warm backend**
- Dashboard loading: **< 2s (Vercel CDN)**
- Notification delivery: **In-app + alert-based system**
- Concurrent user support: **Stateless JWT — scales horizontally**

---

## 🚀 Running Locally (Docker)

### Prerequisites
- Docker Desktop installed
- Java 21 (for local Spring Boot dev)
- Node.js 18+ (for local React dev)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/vadagammanikanta/TripNest.git
cd TripNest

# 2. Build the React frontend
cd tripnest-frontend
npm install
npm run build
cd ..

# 3. Start all services (Backend + Frontend + MySQL)
docker compose up -d --build

# 4. Access the app
# Frontend: http://localhost:8081
# Backend:  http://localhost:8082
```

### Environment Variables (`tripnest-frontend/.env`)
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GROQ_API_KEY=your_groq_api_key
```

---

## 👨‍💻 Developer

**V S S S Manikanta**
- GitHub: [@vadagammanikanta](https://github.com/vadagammanikanta)
- Project: [TripNest on GitHub](https://github.com/vadagammanikanta/TripNest)
- Live App: [trip-nest-sand.vercel.app](https://trip-nest-sand.vercel.app)

---

<div align="center">
  <strong>Built with ❤️ for the Springboard Mentorship Program</strong><br/><br/>
  <a href="https://trip-nest-sand.vercel.app">🚀 Try TripNest Live →</a>
</div>
