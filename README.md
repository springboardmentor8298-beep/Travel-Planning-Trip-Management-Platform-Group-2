# TripNest — Travel Planning & Trip Management Platform

![TripNest Banner](https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80)

**TripNest** is a full-stack, enterprise-grade travel planning and trip management platform built with **React.js 18**, **Spring Boot 3**, and **PostgreSQL 16 / MySQL 8**. It empowers individual travelers, group administrators, and platform administrators to create day-wise itineraries, manage travel budgets, split expenses, track documents, visualize analytics, and communicate via real-time WebSockets and notifications.

---

## 🌟 Architecture & Key Features

### 🔐 1. User Authentication & Role-Based Access
- **JWT & Google OAuth2 Authentication**: Secure session management and Google single sign-on.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for:
  - `TRAVELER`: Core trip planning, budgeting, document storage, and itinerary customization.
  - `GROUP_ADMIN`: Group creation, invitation management, shared expense oversight, and member controls.
  - `ADMINISTRATOR`: Platform management, user analytics, destination management, and revenue monitoring.

### 🗺️ 2. Trip & Day-Wise Itinerary Planning
- **Interactive Trip Management**: Destination tracking, start/end dates, cover image uploads, and member management.
- **Day-Wise Activity Scheduling**: Timed activity creation with categories (*Sightseeing, Transportation, Accommodation, Dining, Adventure, Shopping*) and geolocation integration.
- **Destination Discovery**: Real-time OpenWeather weather integration, destination rating, and popular landmark listings.

### 💰 3. Budget & Expense Management
- **Category-Wise Expense Tracking**: Live tracking across *Transportation, Hotel, Food, Shopping, Entertainment, and Miscellaneous*.
- **Payment & Settlement Gateway**: Payment intent creation, verification, and group expense splitting (Razorpay / Stripe ready).

### 👥 4. Group Collaboration & Media Documents
- **Real-Time WebSockets & STOMP**: Live group discussion chat rooms (`/topic/discussions`).
- **Media & Document Management**: Upload and view travel passes, passports, hotel vouchers, and tickets with auto-generated QR code verification.

### 🔔 5. Multi-Channel Notification System
- **JavaMailSender (SMTP)**: Transactional email delivery for trip invitations and registration welcome emails.
- **Firebase Cloud Messaging (FCM)**: Real-time mobile/web push notifications for travel alerts and itinerary reminders.

### 📊 6. Analytics & Administrative Dashboards
- **Traveler Dashboard**: Interactive budget utilization breakdowns, expense summaries, and upcoming timelines.
- **Admin Dashboard**: System statistics, active user analytics, destination engagement, and financial metrics powered by **Chart.js**.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Axios, Tailwind CSS, Chart.js, Lucide Icons |
| **Backend** | Java 21, Spring Boot 3.2.2, Spring Security, Spring Data JPA, Hibernate, WebSocket/STOMP |
| **Databases** | **PostgreSQL 16** (Production) / **MySQL 8.0** (Local Development) |
| **Notifications** | `JavaMailSender` (Spring Mail) + `Firebase Cloud Messaging` (FCM Admin SDK) |
| **Containerization** | Docker, Docker Compose, Multi-stage Dockerfiles |
| **CI/CD** | GitHub Actions Workflow (`.github/workflows/ci-cd.yml`) |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Java 21 JDK**
- **Node.js 20+ & npm**
- **PostgreSQL 16** (or **MySQL 8.0**)

### 1. Database Configuration (Dual Profile Support)

TripNest supports seamless switching between PostgreSQL and MySQL via Spring Profiles.

- **PostgreSQL (Active Default Profile)**:
  - Database: `tn_web`
  - Host: `localhost:5432`
  - Credentials: `postgres` / `110806`
  - Profile Property: `spring.profiles.active=postgres` in `backend/src/main/resources/application.properties`

- **MySQL (Optional Local Profile)**:
  - Database: `tn_web`
  - Host: `localhost:3306`
  - Profile Property: `spring.profiles.active=mysql` in `backend/src/main/resources/application.properties`

---

### 2. Launch Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```
*Backend will start on `http://localhost:8080`.*

---

### 3. Launch Frontend (React Vite)

```bash
cd frontend
npm install
npm run dev -- --port 5173
```
*Frontend will be available at `http://localhost:5173`.*

---

## 🐳 Docker Deployment (Containerization)

You can launch the entire stack (PostgreSQL + Spring Boot Backend + NGINX React Frontend) using Docker Compose with a single command:

```bash
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080`
- **PostgreSQL Database**: `localhost:5432`

To stop the containers:
```bash
docker-compose down -v
```

---

## 🧪 Running Unit & Integration Tests

### Backend Unit Tests (JUnit 5 + Mockito)
```bash
cd backend
./mvnw test
```

---

## 🌐 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Authenticate & receive JWT token |
| `GET` | `/api/trips` | Get user trips |
| `POST` | `/api/trips` | Create or update trip |
| `DELETE` | `/api/trips/{id}` | Delete trip & associated records |
| `GET` | `/api/activities/trip/{tripId}` | Get day-wise activities for trip |
| `POST` | `/api/activities` | Schedule activity |
| `GET` | `/api/expenses/trip/{tripId}` | Get trip expenses |
| `POST` | `/api/expenses` | Log expense |
| `POST` | `/api/notifications/email/send` | Send email notification via JavaMailSender |
| `POST` | `/api/notifications/fcm/send` | Send push notification via Firebase |
| `GET` | `/api/analytics/traveler` | Get traveler dashboard metrics |
| `GET` | `/api/analytics/admin` | Get administrator analytics |
