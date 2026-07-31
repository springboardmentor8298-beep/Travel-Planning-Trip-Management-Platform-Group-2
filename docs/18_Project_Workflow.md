# 18. Project Workflow Diagrams

This section outlines user workflows through visual UML sequence flows.

---

## 1. Register & Login Workflow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant AuthController
    participant UserService
    participant Database

    User->>Browser: Fill Register Form & Submit
    Browser->>AuthController: POST /api/auth/register
    AuthController->>UserService: Register(Request)
    UserService->>Database: Save encrypted user details
    Database-->>UserService: Confirmation
    UserService-->>Browser: 201 Created (Token + Profile)
    Browser->>User: Redirect to Login/Dashboard

    User->>Browser: Fill Login Form & Submit
    Browser->>AuthController: POST /api/auth/login
    AuthController->>UserService: Login(Request)
    UserService->>Database: Verify credentials
    Database-->>UserService: Match
    UserService-->>Browser: 200 OK (JWT Token)
    Browser->>Browser: Save token in local storage
```

---

## 2. Trip CRUD & Scheduling Workflow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant TripController
    participant TripService
    participant Database

    User->>Browser: Fill Create Trip Form & Submit
    Browser->>TripController: POST /api/trips (Header: Bearer Token)
    TripController->>TripService: createTrip(Payload)
    Note over TripService: Calculate days, instantiate budget & days
    TripService->>Database: Save Trip (Cascade child day entities)
    Database-->>TripService: Saved
    TripService-->>Browser: 200 OK (TripResponse)
    Browser->>User: Render Trip details in Dashboard
```

---

## 3. Itinerary & Activity Planning Workflow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant ItineraryController
    participant ItineraryService
    participant Database

    User->>Browser: Click Day -> Add Activity
    Browser->>ItineraryController: POST /api/trips/{id}/days/{day}/activities
    ItineraryController->>ItineraryService: createActivity(Payload)
    ItineraryService->>Database: Insert new Activity linked to Itinerary ID
    Database-->>ItineraryService: Saved
    ItineraryService-->>Browser: 200 OK (ActivityResponse)
    Browser->>Browser: Dispatch loadTrips() context update
    Browser->>User: Render new activity card in Timeline view
```
