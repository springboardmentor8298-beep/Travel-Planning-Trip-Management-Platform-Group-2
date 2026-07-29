# TripNest — Milestone 1 & 2 Documentation

## 1. Scope Covered

This build is a **continuous codebase** — Milestone 2 is built directly on top of Milestone 1's auth/RBAC/profile layer, not a separate project.

| Milestone | Weeks | Status |
|---|---|---|
| Milestone 1 | Week 1 & 2 | ✅ Complete |
| Milestone 2 | Week 3 & 4 | ✅ Complete |

---

## 2. Milestone 1 Recap (Week 1 & 2)

- JWT authentication (Register/Login)
- User & Role entities (many-to-many), roles: `TRAVELER`, `GROUP_ADMIN`, `ADMINISTRATOR`
- Role-based access control — URL-level (`SecurityConfig`) + method-level (`@PreAuthorize`)
- Profile management — `GET/PUT /api/users/me`, `PUT /api/users/me/password`
- React frontend skeleton — Login, Register, protected Dashboard

*(Deferred by design: OAuth2 Google Login, email-based password reset — flagged as stretch goals, not required for Milestone 1/2 evaluation criteria.)*

---

## 3. Milestone 2 — What Was Built (Week 3 & 4)

### 3.1 Database Schema Additions

| Entity | Purpose | Key Relationships |
|---|---|---|
| `Destination` | Browsable location catalog | Standalone |
| `Trip` | A planned trip | `ManyToOne → User` (owner), `ManyToMany → User` (travelers), `ManyToOne → Destination` |
| `Itinerary` | One day within a trip | `ManyToOne → Trip` |
| `Activity` | A scheduled activity within a day | `ManyToOne → Itinerary` |

```
User ──owns──> Trip ──has many──> Itinerary ──has many──> Activity
              Trip ──links to──> Destination
              Trip ──shared with──> User (travelers, many-to-many)
```

### 3.2 APIs Built

| Module | Method | Endpoint | Access |
|---|---|---|---|
| **Destinations** | GET | `/api/destinations` | Public |
| | GET | `/api/destinations/{id}` | Public |
| | POST | `/api/destinations` | ADMINISTRATOR only |
| **Trips** | POST | `/api/trips` | Authenticated (creates trip, becomes owner) |
| | GET | `/api/trips` | Authenticated (own + shared trips) |
| | GET | `/api/trips/{tripId}` | Owner or traveler on that trip |
| | PUT | `/api/trips/{tripId}` | Owner only |
| | DELETE | `/api/trips/{tripId}` | Owner only |
| | POST | `/api/trips/{tripId}/travelers` | Owner only (trip sharing) |
| | GET | `/api/trips/{tripId}/dashboard` | Owner or traveler |
| **Itineraries** | POST | `/api/trips/{tripId}/itineraries` | Owner or traveler |
| | GET | `/api/trips/{tripId}/itineraries` | Owner or traveler |
| | PUT | `/api/itineraries/{itineraryId}` | Owner or traveler |
| | DELETE | `/api/itineraries/{itineraryId}` | Owner or traveler |
| **Activities** | POST | `/api/itineraries/{itineraryId}/activities` | Owner or traveler |
| | GET | `/api/itineraries/{itineraryId}/activities` | Owner or traveler |
| | PUT | `/api/activities/{activityId}` | Owner or traveler |
| | DELETE | `/api/activities/{activityId}` | Owner or traveler |

### 3.3 Access Control Model

Every Trip/Itinerary/Activity endpoint enforces **ownership or shared-traveler access** at the service layer (not just role-based) — this is stricter than Milestone 1's RBAC and is new in Milestone 2:

- **Owner-only actions**: update trip, delete trip, add traveler
- **Owner-or-traveler actions**: view trip, manage itineraries/activities within it
- Violations throw `AccessDeniedException` → `403 Forbidden` (wired into `GlobalExceptionHandler`)

### 3.4 Trip Dashboard

`GET /api/trips/{tripId}/dashboard` returns:
```json
{
  "tripId": 1,
  "title": "Goa Weekend",
  "totalDays": 4,
  "plannedItineraryDays": 2,
  "totalActivities": 5,
  "budget": 15000.0,
  "status": "PLANNED"
}
```
`totalDays` = full trip length from start/end date. `plannedItineraryDays` = how many days actually have an itinerary built out yet — the gap between these two numbers is a genuinely useful "planning progress" signal for a demo.

---

## 4. Bug Fixed During Build

**Date math bug caught in review:** the dashboard originally used `LocalDate.until().getDays()`, which only returns the day-of-month remainder (e.g., a 40-day trip would report `10`, not `40`). Fixed with `ChronoUnit.DAYS.between()`, which correctly counts total elapsed days regardless of trip length. Worth mentioning to your guide — it shows you're validating logic, not just compiling.

---

## 5. Verification Method (read this before your review)

**I could not run a live `mvn compile` in my build environment** — Maven Central is blocked by network policy there. What I did instead:
1. Cross-referenced all 51 Java files' internal class references — zero missing
2. Verified every entity getter/setter call against the actual `@Getter`/`@Setter`-annotated fields
3. Verified every repository method call against its interface definition
4. Verified every DTO constructor call's argument order/types against its `@AllArgsConstructor` field order
5. Manually walked the date-math logic and caught the bug above

**You must still run this before your review:**
```bash
cd tripnest-backend
mvn clean install -U
```
If it fails, send me the exact error — targeted fixes are fast; guessing blind isn't.

---

## 6. Demo Script for Your Guide

1. Register → Login → copy token
2. `POST /api/destinations` as ADMINISTRATOR → create a destination (or skip, destinationId is optional on Trip)
3. `POST /api/trips` → create a trip
4. `POST /api/trips/{id}/itineraries` → add Day 1
5. `POST /api/itineraries/{id}/activities` → add an activity
6. `GET /api/trips/{id}/dashboard` → show the live summary
7. Try `GET /api/trips/{id}` logged in as a *different* user who isn't a traveler → show the `403`, proving access control isn't just role-based but ownership-based

> "Trip access isn't just checked by role — it's checked by relationship. Only the owner or an explicitly added traveler can see or modify a trip, itinerary, or activity. That's enforced in the service layer, not just at the URL level, so it holds even as we add more entry points later."

---

## 7. Explicitly NOT in Milestone 2 (per your plan doc — Milestone 3 territory)

- Budget & Expense tracking (detailed categories, expense reports)
- Group collaboration (discussions, shared payments)
- Notifications

Trip has a simple `budget` number field as a placeholder; the full Budget/Expense entity model is Milestone 3's job — don't let your guide think it's missing by mistake, it's correctly out of scope here.
