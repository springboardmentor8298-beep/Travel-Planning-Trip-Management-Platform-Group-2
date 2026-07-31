# 08. Destination Module

## Overview
The **Destination Module** (Explore India) provides users with recommendation cards for tourist spots in any Indian state. The backend uses Google's Gemini API to generate spot listings and enriches each spot dynamically with real-time media, coordinates, and descriptions via the Wikipedia API.

---

## Complete Request/Response Data Flow

```
React (User searches "Goa")
   ↓ (GET /api/destinations?state=Goa)
Axios Client
   ↓ (HTTP call to port 8081)
DestinationController
   ↓ (Invokes destinationService.getDestinations)
DestinationServiceImpl
   ↓ (Invokes geminiClient.getDestinations)
GeminiClient ──[Offline/DNS Error?]──> YES ──> [Local Mock Fallback]
   │                                                 │
   ▼ (No API Error)                                  ▼
Gemini API (Returns JSON)                    10 Predefined Spots
   │                                                 │
   └───────────────┬─────────────────────────────────┘
                   ▼
WikipediaClient (fetchSummary for each spot)
   ↓ (REST call to wikipedia.org)
Wikipedia API
   ↓ (Returns page summary JSON)
DestinationServiceImpl (Merges Gemini name + Wikipedia info)
   ↓ (Compiles list of DestinationResponse DTOs)
DestinationController
   ↓ (200 OK with ApiResponse payload)
React Frontend (Renders cards, images, and map buttons)
```

---

## Backend Modules & Responsibilities

### 1. `DestinationController.java`
* **Path**: `GET /api/destinations?country={country}&state={state}`
* **Validations**: Validates that `state` is present and not empty. Returns a `success: false` error response if missing.
* **Exceptions**: Catches all unhandled errors and returns an empty list wrapped in a friendly message rather than failing with a 500 status.

### 2. `DestinationServiceImpl.java`
* **Method**: `getDestinations(country, state)`
* **Steps**:
  1. Calls `GeminiClient` to get a list of tourist spot names and summaries.
  2. For each spot, calls `WikipediaClient.fetchSummary(spotName)`.
  3. Merges coordinates, extracts, and images into a `DestinationResponse` builder.
  4. Returns the compiled list of results.

### 3. `GeminiClient.java`
* **Prompt Generation**:
```
"Suggest 10 famous tourist destinations in state: [Goa], country: [India]. "
+ "Return the response strictly as a JSON array where each object has "
+ "exactly these keys: 'name' and 'famousFor'. Do not write markdown blocks or backticks."
```
* **Resiliency & Fallback**:
  * Implements a retry loop (up to 2 retries with a 1-second delay).
  * Catches connection and DNS failures (like `UnknownHostException` when offline).
  * On failure, logs a warning and calls `getMockDestinations(state)` to generate a list of mock destinations locally, keeping the app functional offline.

### 4. `WikipediaClient.java`
* **Sanitization**: Splitting the name by parenthesis and replacing spaces with underscores (e.g. `"Araku Valley (Hill Station)"` -> `"Araku_Valley"`).
* **Caching**: Stores retrieved summaries in a `ConcurrentHashMap` cache to avoid redundant network calls for identical destinations.
* **404 Handling**: Catches `HttpClientErrorException.NotFound` and logs a clean, one-line warning instead of dumping a full stacktrace when a landmark doesn't have a Wikipedia page.

---

## Sample Request & Response payloads

### Request
`GET http://localhost:8081/api/destinations?state=Goa`

### Response
```json
{
  "success": true,
  "message": "Successfully retrieved destinations",
  "data": [
    {
      "name": "Calangute Beach",
      "famousFor": "Known as the Queen of Beaches, famous for water sports.",
      "shortDescription": "Calangute is a town in the North Goa district of the Indian state of Goa.",
      "fullDescription": "Calangute is a town in the North Goa district of the Indian state of Goa. It is famous for its beach, the largest in North Goa, visited by thousands of domestic and international tourists alike...",
      "thumbnail": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Calangute_Beach_Goa.jpg/320px-Calangute_Beach_Goa.jpg",
      "image": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Calangute_Beach_Goa.jpg",
      "latitude": 15.5444,
      "longitude": 73.7554,
      "wikipediaUrl": "https://en.wikipedia.org/wiki/Calangute"
    }
  ]
}
```
---

## Frontend Integration (`DestinationsPage.jsx`)
* Form submission triggers `getDestinations` from `destinationService.js`.
* Each card renders:
  * Thumbnail with a fallback placeholder icon if no image is available.
  * Description summary.
  * **Map button**: Opens Google Maps in a new tab using the coordinates: `https://www.google.com/maps/search/?api=1&query={lat},{lon}`.
  * **Wikipedia link**: Opens the source page in a new tab.
  
