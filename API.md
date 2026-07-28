# TripNest API

All secured endpoints require `Authorization: Bearer <jwt>`.

## Authentication

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create a traveler account and return access and refresh tokens |
| POST | `/api/auth/login` | Sign in and return access and refresh tokens |
| POST | `/api/auth/refresh` | Rotate a valid refresh token and return a new token pair |

## Trips

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/trips?q=&status=&sort=upcoming&page=0&size=12` | Paginated, searchable trip list |
| POST | `/api/trips` | Create a trip |
| GET, PUT, DELETE | `/api/trips/{tripId}` | View, update, or delete an owned trip |
| GET, POST | `/api/trips/{tripId}/itineraries` | List or create itinerary days |
| PUT, DELETE | `/api/trips/{tripId}/itineraries/{itineraryId}` | Update or delete a day |
| POST | `/api/trips/{tripId}/itineraries/{itineraryId}/activities` | Add an activity |
| PUT, DELETE | `/api/trips/{tripId}/itineraries/{itineraryId}/activities/{activityId}` | Update or delete an activity |
| PATCH | `/api/trips/{tripId}/itineraries/{itineraryId}/activities/order` | Persist activity order with `{ "activityIds": [1, 2] }` |
| GET, POST | `/api/trips/{tripId}/members` | List or invite travelers |
| DELETE | `/api/trips/{tripId}/members/{memberId}` | Remove a traveler |

Activity types are `Sightseeing`, `Transportation`, `Accommodation`, `Dining`, `Adventure`, `Shopping`, and `Others`.

Activities accept optional `endTime`, `durationMinutes`, `notes`, `status`, and `reminderAt` fields. A due `reminderAt` creates an in-app activity reminder for the trip owner.

## Milestone 3: finances, collaboration, notifications, and documents

| Method | Path | Request example | Purpose |
|---|---|---|---|
| GET, PUT | `/api/trips/{tripId}/budget` | `{ "totalBudget": 50000 }` | Read or plan a trip budget. |
| GET, POST | `/api/trips/{tripId}/expenses` | `{ "category":"Food", "description":"Dinner", "amount":850, "paymentMethod":"Card", "expenseDate":"2026-07-28" }` | List or record an expense. |
| PUT, DELETE | `/api/trips/{tripId}/expenses/{expenseId}` | Same expense payload | Change or remove an expense. |
| GET | `/api/trips/{tripId}/expenses/summary` | — | Total and category breakdown for charts. |
| GET | `/api/trips/{tripId}/expenses/report.csv` | — | Download a spreadsheet-compatible expense report. |
| GET, POST | `/api/groups` | `{ "name":"Beach crew", "description":"Goa trip", "tripId":1 }` | List or create travel groups. |
| GET | `/api/groups/{groupId}` | — | Read group members and linked trip. |
| POST | `/api/groups/{groupId}/members` | `{ "email":"friend@example.com", "memberRole":"MEMBER" }` | Invite an existing user. |
| PUT, DELETE | `/api/groups/{groupId}/members/{memberId}` | `{ "email":"friend@example.com", "memberRole":"ADMIN" }` | Change member role or remove member. |
| GET, POST | `/api/groups/{groupId}/messages` | `{ "message":"Train leaves at 8 AM" }` | Read or post group discussion messages. |
| GET, PATCH | `/api/notifications`, `/api/notifications/{id}/read` | — | List and mark in-app notifications read. |
| PATCH | `/api/notifications/read-all` | — | Mark every notification read. |
| GET, POST | `/api/trips/{tripId}/documents` | multipart: `file`, `documentType` | List/upload PDF, DOCX, JPG, PNG, or WEBP trip documents. |
| GET, DELETE | `/api/trips/{tripId}/documents/{documentId}/download` | — | Download or delete a document. |

## Account recovery and profile

| Method | Path | Request example | Purpose |
|---|---|---|---|
| POST | `/api/auth/password-reset/request` | `{ "email":"traveler@example.com" }` | Start a reset request without account enumeration. |
| POST | `/api/auth/password-reset/confirm` | `{ "token":"reset-token", "newPassword":"at-least-8-characters" }` | Reset password and invalidate active refresh tokens. |
| POST | `/api/profile/picture` | multipart: `file` | Upload JPG, PNG, or WEBP profile image up to 2 MB. |

## Destination discovery

`GET /api/destinations/popular?limit=6` returns popular places. Destination detail responses include travel-guide copy, attractions, an external Google Maps URL, and a clearly labelled weather placeholder. Configure a weather provider separately before presenting live weather as factual data.

All error responses use `{ "timestamp", "status", "message", "path" }`. Validation errors are `400`; absent resources are `404`; duplicate resources are `409`; authorization failures are `403`.

## Destinations and profile

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/destinations` | List seeded destinations |
| GET | `/api/destinations/search?q=&page=0&size=12` | Search destinations |
| GET | `/api/destinations/{id}` | Destination detail |
| GET, PUT | `/api/profile` | Read or update the signed-in profile |
| GET | `/api/profile/favorites` | List saved destinations |
| POST, DELETE | `/api/profile/favorites/{destinationId}` | Save or remove a destination |
