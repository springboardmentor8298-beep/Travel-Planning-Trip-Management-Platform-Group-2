### \# TripNest



Travel planning \& trip management platform. A full-stack React + Spring Boot

application for planning trips, building day-wise itineraries, scheduling

activities, and (in upcoming milestones) tracking budgets and collaborating

with travel groups.



\*\*Current progress:\*\* Milestone 2 of 4 complete.



##### \## What's included so far



###### \*\*Backend (Spring Boot 3.3, Java 21)\*\*

\- JWT authentication (register / login / refresh / logout / forgot \& reset password) + Google OAuth2 login

\- Role-based access control (ROLE\_TRAVELER, ROLE\_GROUP\_ADMIN, ROLE\_ADMIN)

\- Full database schema via Flyway (Trips, Itineraries, Activities, Destinations, Budgets, Expenses, Notifications)

\- Trip management: create, list, update, delete, status transitions - owner-scoped

\- Itinerary planning: auto-generate a day-by-day skeleton from trip dates, or add/edit/delete days manually

\- Activity scheduling with overlap/conflict detection

\- Destination browsing and search, with admin-only management endpoints

\- Global exception handling with consistent JSON error responses

\- OpenAPI/Swagger docs at /swagger-ui.html



###### \*\*Frontend (React 18 + Vite)\*\*

\- Login, register, forgot/reset password, Google OAuth callback

\- Axios client with silent access-token refresh on 401

\- Protected routes + auth context

\- Trips list, trip creation/editing, and a per-trip dashboard with itinerary + activity management

\- Destinations browsing page

\- Tailwind design system



###### \## Prerequisites

\- Docker Desktop installed and running



\## Quick start (Docker Compose)

cp backend/.env.example backend/.env

docker compose up --build



\- Frontend: http://localhost:5173

\- Backend: http://localhost:8080

\- Swagger UI: http://localhost:8080/swagger-ui.html



To stop everything:

docker compose down



###### \## Google OAuth2 setup

1\. Create an OAuth 2.0 Client ID at console.cloud.google.com (type: Web application).

2\. Authorized redirect URI: http://localhost:8080/login/oauth2/code/google

3\. Put the client ID/secret in backend/.env before running docker compose up.

4\. The backend redirects back to OAUTH2\_REDIRECT\_URI with the access token in the query string.



\## Roadmap

\- Milestone 3 - Budget \& expense management, group collaboration, notifications, document uploads

\- Milestone 4 - Analytics dashboards, testing, production deployment



###### \## Project structure

tripnest/

&#x20; backend/   Spring Boot API

&#x20; frontend/  React SPA

&#x20; docker-compose.yml

