# 01. Project Overview

## What is TripNest?
**TripNest** is a next-generation Travel Planning & Trip Management Platform. Designed for modern explorers, group travelers, and solo adventurers, it simplifies the complex process of organizing journeys. TripNest provides an intuitive interface to create trips, map schedules, track budgets, log activities, and explore tourist destinations in India using AI-driven recommendation and open-source information enrichment.

---

## Problem Statement
Planning a vacation or a business trip is often stressful and fragmented:
1. **Scattered Resources**: Users have to switch between multiple platforms to look up destinations, plan itineraries, track travel budgets, and store documents.
2. **Static & Outdated Content**: Traditional travel guides offer static lists that do not adapt to user preferences or real-time context.
3. **No Centralized Budgeting**: Keeping track of lodging, transport, food, and sightseeing expenses in a shared group often results in spreadsheet chaos.
4. **Lack of Personalization**: AI-driven itinerary suggestions are typically behind paywalls or disjointed from actual trip planning tools.

---

## Project Goals
* **Unified Workspace**: Consolidate trip scheduling, budgeting, profile management, and destination research under one roof.
* **AI-Powered Exploration**: Leverage Google's Gemini LLM to generate dynamic, personalized tourist recommendations based on states and regions.
* **Open Information Enrichment**: Auto-enrich recommendations with geo-coordinates, page links, descriptions, and media assets using the Wikipedia REST API.
* **Robust Multi-Tenant Security**: Protect user data and travel details using Spring Security and stateless JWT authentication.
* **Production-Ready & Stable Architecture**: Deliver a microservice-ready backend and responsive React frontend that builds cleanly, compiles statically, and handles network or third-party service failures gracefully.

---

## Target Users
* **Solo Backpackers**: Looking for quick itinerary setups and automated destination info.
* **Group Travelers / Families**: Need to manage multi-member counts, budgets, and detailed daily activity slots.
* **Internship/Student Developers**: Seeking a clean, enterprise-grade codebase to understand the integration of Spring Boot, React, MapStruct, JPA, and AI clients.

---

## Major Features
1. **User Authentication**: Secure register/login flow using JWT, protected routes, and automated token-expiration redirects.
2. **Dashboard**: High-level statistics (total trips, spent budget, remaining budget) accompanied by visual interactive charts.
3. **Trip Manager**: Complete CRUD operations for trips, allowing users to configure names, dates, destination names, total members, budgets, and cover images.
4. **Interactive Itinerary Planner**: Organize travel days with specific, ordered activities. Users can create, update, and delete activities mapped to individual itinerary days.
5. **Explore India (Destination Search)**: Search for any Indian state to receive recommendations. Features robust network retry loops and offline mock-data fallbacks if Gemini is unreachable.
6. **Wikipedia Media Enrichment**: Automatically fetches real-time coordinates, descriptions, and thumbnails for each destination.

---

## Technology Stack

### Backend Stack
* **Java 17 (LTS)**: Core language platform.
* **Spring Boot 3.x**: Micro-framework for RESTful APIs.
* **Spring Security & JWT**: Stateful-to-stateless session protection and token filter chain.
* **Spring Data JPA & Hibernate**: Object-relational mapping.
* **MySQL**: Primary relational database.
* **MapStruct**: High-performance, compile-time DTO-to-entity mapping.
* **Lombok**: Automatic boilerplate reduction (Getters, Setters, Builders).
* **Maven**: Dependency management and build packaging.

### Frontend Stack
* **React 19**: Responsive client-side UI library.
* **Vite**: Ultra-fast frontend build tool and dev server.
* **React Router Dom v7**: Declarative routing.
* **Axios**: HTTP requests with request-level token attachment and response-level 401 interception.
* **Tailwind CSS**: Utility-first CSS styling.
* **Framer Motion**: Smooth animations.
* **Lucide React**: Vector icons.

---

## Project Folder Structure

### Backend (`TripNest_Backend`)
```
TripNest_Backend/
│
├── src/
│   ├── main/
│   │   ├── java/com/tripnest/backend/
│   │   │   ├── client/          # Third-party clients (Gemini, Wikipedia)
│   │   │   ├── config/          # Configurations (Security, CORS, Jackson)
│   │   │   ├── controller/      # REST Endpoints
│   │   │   ├── dto/             # Request & Response DTOs
│   │   │   ├── entity/          # JPA Entities
│   │   │   ├── exception/       # Exception Handling Framework
│   │   │   ├── mapper/          # MapStruct Mappers
│   │   │   ├── repository/      # Spring Data Repositories
│   │   │   └── service/         # Interfaces & Implementations
│   │   │
│   │   └── resources/
│   │       ├── application.properties  # Ports, Database, & API keys
│   │       └── data.sql                # Seed script for initial setup
│   │
│   └── test/
│       └── java/com/tripnest/backend/  # Unit & Integration Tests
│
├── pom.xml                      # Maven Configuration
└── mvnw.cmd                     # Maven Wrapper
```

### Frontend (`TripNest_Frontend`)
```
TripNest_Frontend/
│
├── src/
│   ├── components/      # Shared reusable UI components
│   ├── context/         # React Context API (AppContext)
│   ├── data/            # Local seed structures
│   ├── layouts/         # Page templates (MainLayout)
│   ├── pages/           # View modules (Dashboard, Planner, Destinations)
│   ├── services/        # Axios API service integrations
│   ├── utils/           # Helper scripts (Token, Date, Currency)
│   ├── App.jsx          # Root component & routing
│   ├── main.jsx         # DOM Mounting entrypoint
│   └── index.css        # Global CSS stylesheet
│
├── package.json         # npm dependencies & build scripts
├── tailwind.config.js   # Tailwind Configuration
└── vite.config.js       # Vite Bundler configurations
```
