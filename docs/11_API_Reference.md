# 11. API Reference Catalog

All API endpoints are prefixed with `/api`. Standard responses are wrapped in a generic `ApiResponse<T>` structure:
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": null
}
```

---

## Authentication Endpoints

### 1. Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Auth Required**: No
* **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ...",
    "user": {
      "email": "jane@example.com",
      "name": "Jane Doe"
    }
  }
}
```

### 2. Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Auth Required**: No
* **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ...",
    "user": {
      "email": "jane@example.com",
      "name": "Jane Doe"
    }
  }
}
```

---

## Trip Endpoints

### 1. Fetch My Trips
* **URL**: `/api/trips`
* **Method**: `GET`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Trips retrieved successfully",
  "data": [
    {
      "id": 1,
      "tripName": "Summer Holiday",
      "startDate": "2026-08-01",
      "endDate": "2026-08-05",
      "status": "UPCOMING",
      "destination": "Goa",
      "budget": 50000.0,
      "spent": 0.0,
      "itinerary": []
    }
  ]
}
```

### 2. Create Trip
* **URL**: `/api/trips`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "tripName": "Summer Holiday",
  "startDate": "2026-08-01",
  "endDate": "2026-08-05",
  "destinationName": "Goa",
  "city": "Calangute",
  "state": "Goa",
  "country": "India",
  "budget": 50000.0,
  "totalMembers": 2,
  "notes": "Beach trip",
  "description": "Vacation with friends"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "id": 1,
    "tripName": "Summer Holiday",
    "startDate": "2026-08-01",
    "endDate": "2026-08-05",
    "status": "UPCOMING",
    "destination": "Goa",
    "budget": 50000.0,
    "spent": 0.0,
    "itinerary": [
      {
        "id": 1,
        "dayNumber": 1,
        "date": "2026-08-01",
        "notes": null,
        "activities": []
      }
    ]
  }
}
```

---

## Itinerary & Activity Endpoints

### 1. Add Daily Activity
* **URL**: `/api/trips/{tripId}/days/{dayNumber}/activities`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token)
* **Request Body**:
```json
{
  "title": "Baga Beach Sunset",
  "description": "Watch sunset and have dinner.",
  "activityTime": "17:00:00",
  "activityType": "SIGHTSEEING"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Activity created successfully",
  "data": {
    "id": 5,
    "title": "Baga Beach Sunset",
    "description": "Watch sunset and have dinner.",
    "activityTime": "17:00:00",
    "activityType": "SIGHTSEEING"
  }
}
```

---

## Destination Search Endpoints

### 1. Search State Destinations
* **URL**: `/api/destinations?state={state}`
* **Method**: `GET`
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Successfully retrieved destinations",
  "data": [
    {
      "name": "Fort Aguada",
      "famousFor": "Historic Portuguese fort and lighthouse.",
      "shortDescription": "Fort Aguada is a well-preserved seventeenth-century Portuguese fort...",
      "thumbnail": "https://upload.wikimedia.org/.../Aguada_Fort.jpg",
      "latitude": 15.4925,
      "longitude": 73.7739,
      "wikipediaUrl": "https://en.wikipedia.org/wiki/Fort_Aguada"
    }
  ]
}
```
