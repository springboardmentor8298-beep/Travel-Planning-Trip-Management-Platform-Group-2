# 🌍 TripNest — AI-Powered Travel Planning Platform

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
| 📦 **Frontend Repo (Personal)** | [github.com/vadagammanikanta/TripNest](https://github.com/vadagammanikanta/TripNest) |

> ⚠️ The backend is hosted on Render's free tier and may take ~30 seconds to wake up on the first request.

---

## 📖 About TripNest

TripNest is a **full-stack, AI-powered travel planning and trip management platform** built with React.js and Spring Boot. It allows travelers to plan trips, build day-wise itineraries, manage budgets, collaborate with friends and family in real-time, track expenses, share documents, and get instant travel guidance from an integrated AI Tourist Guide — all in one beautifully designed, dark-mode-enabled interface.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based stateless authentication (access + refresh tokens)
- Google OAuth 2.0 Sign-In via Google Identity Services
- Role-Based Access Control (USER / ADMIN)
- Secure password hashing with BCrypt
- Password reset via email token

### 🗺️ Trip Management
- Create, edit, and delete trips with full details (destination, dates, travelers, budget)
- Day-wise **Itinerary Builder** with drag-and-arrange activities
- **Trip Status** tracking (Planning → Active → Completed)
- Public shareable trip links with a unique token
- PDF export of complete trip summary

### 💰 Budget & Expense Tracking
- Per-trip budget setting and real-time spend monitoring
- Log expenses by category (Food, Transport, Hotel, Activities, etc.)
- Visual **Analytics Dashboard** (Pie charts, Bar graphs, Budget gauge)
- **Group Expense Splitting** — split bills among trip members automatically

### 👥 Collaboration & Social
- Invite members to trips by username or email
- **Real-time Group Chat** per trip (WebSocket/polling)
- In-app notification system (budget alerts, invitations, reminders)
- Accept/decline trip invitations

### 📁 Travel Documents
- Upload and organize travel documents per trip (PDF, images)
- Download documents from anywhere with secure links

### 🌍 Discover & Explore
- Interactive **Leaflet Maps** with trip destination markers
- **Live Weather Forecast** widget powered by Open-Meteo API

### 🤖 AI Tourist Guide
- Integrated AI chatbot powered by **Groq Cloud (LLaMA 3.3 70B)**
- Knows all your trip details, destinations, budget, and live weather
- Provides local tourist recommendations, food guides, packing tips, and budget breakdowns
- Persistent floating agent on every screen

### 🎨 UI/UX
- Premium dark mode + light mode toggle
- Glassmorphism design with smooth animations
- Fully responsive layout
- Admin portal for user management

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router, Axios, Leaflet.js |
| **Styling** | Vanilla CSS, Custom Design System |
| **Backend** | Spring Boot 3.2, Spring Security, Spring Data JPA |
| **Authentication** | JWT, Google OAuth 2.0 (Google Identity Services) |
| **Database** | MySQL 8 (local), TiDB Serverless (cloud) |
| **AI** | Groq Cloud API (LLaMA 3.3 70B Versatile) |
| **Weather** | Open-Meteo API (free, no key required) |
| **Maps** | Leaflet.js + OpenStreetMap |
| **Containerization** | Docker, Docker Compose |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |
| **Database Hosting** | TiDB Serverless |

---

## 🏛️ Architecture

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
│  - JPA Repositories + Hibernate                            │
└──────────────────────┬──────────────────────────────────────┘
                       │ JDBC / TLS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           TiDB Serverless (MySQL-compatible cloud DB)       │
│         gateway01.ap-southeast-1.prod.aws.tidbcloud.com     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
TripNest/
├── tripnest/                    # Spring Boot Backend
│   ├── src/main/java/com/tripnest/
│   │   ├── controller/          # REST Controllers
│   │   ├── service/             # Business Logic
│   │   ├── repository/          # JPA Repositories
│   │   ├── model/               # Entity Classes
│   │   ├── security/            # JWT + Spring Security
│   │   └── dto/                 # Data Transfer Objects
│   └── Dockerfile
│
├── tripnest-frontend/           # React Frontend
│   ├── src/
│   │   ├── components/          # Page Components (Dashboard, Login, etc.)
│   │   ├── context/             # Auth + Theme Context
│   │   ├── services/            # Axios API Services
│   │   └── index.css            # Global Design System
│   ├── vercel.json              # Vercel proxy config (links to backend)
│   ├── nginx.conf               # Nginx config for Docker
│   └── Dockerfile
│
├── docker-compose.yml           # Local Docker stack
├── docker-compose.prod.yml      # Production Docker stack
└── README.md
```

---

## 🚀 Running Locally (Docker)

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

### Environment Variables

Create a `tripnest-frontend/.env` file:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GROQ_API_KEY=your_groq_api_key
```

---

## 📊 Milestone Progress

| # | Milestone | Status |
|---|---|---|
| 1 | User Auth, JWT, Roles, Trip CRUD | ✅ Complete |
| 2 | Itinerary, Activities, Destinations | ✅ Complete |
| 3 | Documents, PDF Export, Public Sharing | ✅ Complete |
| 4 | Expenses, Analytics, Group Splits | ✅ Complete |
| 5 | Collaboration, Group Chat, Notifications | ✅ Complete |
| 6 | Maps, Weather Widget, Admin Portal | ✅ Complete |
| 7 | AI Tourist Guide, Google OAuth, Dark Mode | ✅ Complete |
| ☁️ | Cloud Deployment (TiDB + Render + Vercel) | ✅ Complete |

---

## 👨‍💻 Developer

**V S S S Manikanta**
- GitHub: [@vadagammanikanta](https://github.com/vadagammanikanta)
- Project: [TripNest on GitHub](https://github.com/vadagammanikanta/TripNest)

---

<div align="center">
  <strong>Built with ❤️ for the Springboard Mentorship Program</strong><br/>
  <a href="https://trip-nest-sand.vercel.app">🚀 Try TripNest Live</a>
</div>
