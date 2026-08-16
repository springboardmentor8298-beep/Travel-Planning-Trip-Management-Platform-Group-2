# 🌍 TripNest — Travel Planning & Trip Management Platform

**Plan smarter. Travel better. Collaborate effortlessly.**

---

### 🔗 Live Links
* 🌐 **Live Application:** [https://trip-nest-sand.vercel.app](https://trip-nest-sand.vercel.app)
* ⚙️ **REST API:** [https://tripnest-backend-4epj.onrender.com](https://tripnest-backend-4epj.onrender.com)
* 📦 **GitHub Repository:** [Your-GitHub-Repo-URL]

> ⚠️ **Note:** The backend is hosted on Render's free tier and may take ~30 seconds to wake up on the first request.

---

## 📋 Table of Contents
1. [Objective](#-objective)
2. [Outcomes Achieved](#-outcomes-achieved)
3. [Modules Implemented](#-modules-implemented)
4. [Week-wise Milestone Progress](#-week-wise-milestone-progress)
5. [Architecture](#-architecture)
6. [Tech Stack](#-tech-stack)
7. [Project Structure](#-project-structure)
8. [Evaluation Criteria](#-evaluation-criteria)
9. [Performance Metrics](#-performance-metrics)
10. [Running Locally](#-running-locally)

---

## 🎯 Objective

Build a full-stack web application (**React.js frontend + Spring Boot backend**) that enables travelers to:
* 🗺️ **Plan trips** with day-wise itineraries and activity scheduling
* 💰 **Manage budgets** and track expenses across categories
* 👥 **Collaborate** with friends and family on shared trip plans
* 📁 **Organize travel documents** (tickets, visas, hotel bookings, photos)
* 🔔 **Stay notified** with trip reminders, budget alerts, and group invitations
* 🌍 **Discover destinations** with curated travel guides and attraction listings
* 🤖 **Get AI-powered guidance** via an integrated Tourist Guide Agent

---

## ✅ Outcomes Achieved

* ✅ Developed and deployed a full-stack React.js + Spring Boot application
* ✅ Implemented secure user authentication using JWT and OAuth2 (Google)
* ✅ Built trip creation and itinerary management functionality
* ✅ Implemented budget and expense tracking systems
* ✅ Added collaborative trip planning and group management
* ✅ Created dashboards for trip analytics and expense reports
* ✅ Integrated maps (Leaflet.js) and location services (Open-Meteo Weather API)
* ✅ Deployed frontend (Vercel) and backend (Render) with TiDB cloud database
* ✅ Added notifications for trip reminders and travel updates
* ✅ Integrated AI Tourist Guide powered by Groq LLaMA 3.3 70B

---

## 🧩 Modules Implemented

### 1. 🔐 User Authentication & Role-Based Access
* JWT Authentication (Stateless, access tokens)
* Google OAuth2 Login (Google Identity Services SDK)
* Password Reset via email token
* Profile Management with avatar upload
* Roles: Traveler, Group Admin, Administrator

### 2. 👤 User Profile Management
* Profile creation and editing
* Travel preferences and favorite destinations
* Account settings and password change
* Travel history (completed trips)
* Profile customization

### 3. 🗺️ Trip Management System
* Create, Edit, Delete trips
* View trip details with full timeline
* Trip sharing via unique public token
* Trip Information: Destination, Start/End Date, Travelers, Budget, Status

### 4. 📅 Itinerary Planning System
* Day-wise itinerary creation
* Activity scheduling with types: Sightseeing, Transportation, Accommodation, Dining, Adventure, Shopping
* Place management and travel timeline
* Activity reminders via notification system

### 5. 💰 Budget & Expense Management
* Budget planning per trip
* Expense recording with category tagging
* Category-wise expenses: Transportation, Hotel, Food, Shopping, Entertainment, Miscellaneous
* Cost estimation and budget gauge widget
* Expense reports with pie charts and bar graphs
* Group Expense Splitting — auto-split bills among trip members

### 6. 👥 Group Collaboration System
* Create travel groups / invite members by email or username
* Shared itineraries
* Real-time Group Chat per trip
* Shared expenses with split management
* Role management (Owner, Editor, Viewer)

### 7. 🌍 Destination Discovery System
* Browse and search destinations
* Destination details and attraction listings
* Travel guides via AI Tourist Agent
* Live Weather information (Open-Meteo API)
* Interactive map with location markers (Leaflet.js)

### 8. 📁 Media & Document Management
* Upload travel documents (PDF, images)
* Upload tickets, hotel bookings, visas
* Trip PDF export (complete summary)
* Secure cloud-compatible document storage

### 9. 🔔 Notification System
* Trip reminders and activity reminders
* Budget alerts (when spending exceeds thresholds)
* Group invitations
* System notifications with in-app bell indicator
* Mark all/individual notifications as read

### 10. 📊 Reports & Analytics
**Traveler Dashboard**
* Upcoming trips overview
* Budget overview with gauge chart
* Expense summary with visual breakdown
* Travel statistics (trips completed, total spend, destinations)
* Favorite destinations

**Admin Dashboard**
* User analytics (total users, active users)
* Trip analytics (trips created, destinations)
* Platform statistics and activity logs

### 11. 💳 Payment Management
* Group expense splitting
* Shared expense tracking
* Settlement management (who owes what to whom)

### 12. 🤖 AI Tourist Guide (Bonus Feature)
* Integrated Groq Cloud AI (LLaMA 3.3 70B Versatile model)
* Aware of live trip details, budget, weather, and all user trips
* Provides tourist recommendations, food guides, packing tips
* Floating agent widget accessible on every screen

### 13. ☁️ Final Integration, Testing & Deployment
* Frontend and backend integration
* API validation and Postman testing
* Security testing (JWT, CORS, input validation)
* Production deployment (Vercel + Render + TiDB)

---

## 📅 Week-wise Milestone Progress

### ✅ Milestone 1 — Week 1 & 2: Requirements, Database Design & Backend Setup
| Task | Status |
| :--- | :--- |
| Define project scope and user roles | ✅ Done |
| Design database schema (Users, Roles, Trips, Itineraries, Activities, Destinations, Budgets, Expenses, Notifications) | ✅ Done |
| Initialize Spring Boot project | ✅ Done |
| Configure MySQL database | ✅ Done |
| Implement JWT authentication | ✅ Done |
| Create React frontend skeleton | ✅ Done |

### ✅ Milestone 2 — Week 3 & 4: Trip & Itinerary Management
| Task | Status |
| :--- | :--- |
| Implement trip management APIs | ✅ Done |
| Build itinerary creation functionality | ✅ Done |
| Develop destination pages | ✅ Done |
| Create trip dashboards | ✅ Done |
| Implement activity scheduling | ✅ Done |

### ✅ Milestone 3 — Week 5 & 6: Budget, Expenses & Collaboration
| Task | Status |
| :--- | :--- |
| Implement budget management system | ✅ Done |
| Build expense tracking functionality | ✅ Done |
| Create group collaboration workflow | ✅ Done |
| Implement notifications | ✅ Done |
| Add document upload system | ✅ Done |

### ✅ Milestone 4 — Week 7 & 8: Analytics, Testing & Deployment
| Task | Status |
| :--- | :--- |
| Build analytics dashboard | ✅ Done |
| Add reports and charts | ✅ Done |
| Implement testing and validations | ✅ Done |
| Deploy frontend (Vercel) + backend (Render) | ✅ Done |
| Configure production environment with TiDB | ✅ Done |
| Add AI Tourist Guide (Groq LLaMA 3.3) | ✅ Done (Bonus) |
| Add Google OAuth2 Sign-In | ✅ Done (Bonus) |

---

## 🏗️ Architecture

```text
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