# TripNest Milestone 2 Starter Project

Includes:
- User signup and login
- Trip management
- Itinerary creation
- Destination management
- Activity scheduling
- Dashboard
- MySQL + Spring Boot backend
- React + Vite frontend

## Backend

1. Make sure MySQL is running.
2. Check `tripnest-backend/src/main/resources/application.properties`.
3. Default database settings:
   - database: tripnest_db
   - username: root
   - password: root
4. Run:

Windows:
mvnw.cmd spring-boot:run

Backend: http://localhost:8080

## Frontend

Open a second terminal:

cd tripnest-frontend
npm install
npm run dev

Frontend: http://localhost:5173

## Demo flow

1. Open http://localhost:5173/signup
2. Create an account.
3. Login.
4. Dashboard opens.
5. Demonstrate:
   - Trips
   - Itinerary
   - Destinations
   - Activities

The database tables are created automatically by JPA (`ddl-auto=update`).

IMPORTANT:
This starter uses simple password comparison for a milestone/demo project. It is not production-grade authentication. JWT and password hashing should be added before production use.
