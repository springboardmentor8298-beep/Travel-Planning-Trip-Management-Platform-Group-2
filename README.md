# TripNest — Milestone 1

Travel planning & trip management platform. This milestone delivers the
full authentication system, the database schema for the whole application,
and the project scaffolding both services will build on.

## What's included

**Backend (Spring Boot 3.3, Java 21)**
- Register / login / refresh / logout / forgot-password / reset-password
- Google OAuth2 login with automatic account creation
- Stateless JWT access tokens (15 min) + opaque, rotating refresh tokens (7 days) stored server-side so they can be revoked
- Role-based access control (`ROLE_TRAVELER`, `ROLE_GROUP_ADMIN`, `ROLE_ADMIN`)
- Full schema for every future module (Trips, Itineraries, Activities, Budgets, Expenses, Notifications, Destinations) via Flyway, so later milestones are additive, not migrations-in-a-hurry
- Global exception handling with consistent JSON error shapes
- OpenAPI/Swagger docs at `/swagger-ui.html`

**Frontend (React 18 + Vite)**
- Login, register, forgot/reset password, Google OAuth callback
- Axios client with silent access-token refresh on 401
- Protected routes + auth context
- Dashboard shell with sidebar nav and placeholders for upcoming modules
- Tailwind design system (see `frontend/tailwind.config.js`)

## Prerequisites
- Java 21, Maven 3.9+
- Node 20+
- MySQL 8 running locally (or use Docker Compose)

## Quick start (Docker Compose)
```bash
cp backend/.env.example backend/.env   # fill in JWT_SECRET at minimum
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

## Running locally without Docker

**Backend**
```bash
cd backend
cp .env.example .env   # edit values, then export them or use an IDE run config
mvn spring-boot:run
```
By default it targets a local MySQL at `localhost:3306/tripnest_dev` — Flyway creates all tables and seeds the three roles on first boot.

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Google OAuth2 setup
1. Create an OAuth 2.0 Client ID at console.cloud.google.com (type: Web application).
2. Authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`.
3. Put the client ID/secret in `backend/.env` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
4. The backend redirects back to the frontend at `OAUTH2_REDIRECT_URI` (`http://localhost:5173/oauth2/callback`) with the access token in the query string.

## Switching databases
- `dev` profile (default): MySQL, migrations in `backend/src/main/resources/db/migration/mysql`.
- `prod` profile: PostgreSQL, migrations in `backend/src/main/resources/db/migration/postgres`. Activate with `SPRING_PROFILES_ACTIVE=prod` and the matching `DB_*` env vars.

## Known Milestone 1 scope boundaries
- Email delivery is a logging stub (`LoggingEmailServiceImpl`) — swap in a real provider without touching `AuthService` when that milestone lands.
- Trip/itinerary/budget/notification tables exist in the schema but have no endpoints yet; the dashboard shows "coming soon" placeholders for them.
- Google-login sessions get an access token but no refresh token yet (only local accounts get the full rotation flow) — acceptable for this milestone, worth revisiting alongside email.

## Project structure
```
tripnest/
├── backend/   Spring Boot API (see backend/src/main/java/com/tripnest)
├── frontend/  React SPA (see frontend/src)
└── docker-compose.yml
```
