# 17. Milestone 2 Documentation

## Objectives
* Implement the core travel planner CRUD operations.
* Automate itinerary day generation based on trip start and end dates.
* Integrate Google's Gemini API for state recommendations.
* Enrich recommendations with Wikipedia media and coordinates.
* Implement robust error handling and fallbacks for external APIs.

---

## Features Implemented
1. **Dynamic Itinerary Generation**: Backend calculates date ranges and generates blank daily itineraries when a trip is created.
2. **Activity CRUD**: Added endpoints to create, update, and delete activities for specific travel days.
3. **Explore India**: Created search flows that prompt Gemini for landmarks in a state, then queries Wikipedia to enrich each result with coordinates, images, and extracts.
4. **Resiliency Fallbacks**: Configured retries in `GeminiClient` and added an offline mock data generator for when the API is unreachable.
5. **Wikipedia Error Mitigation**: Catching 404 page-not-found exceptions in `WikipediaClient` to avoid console stacktrace clutter.

---

## Technical Details

### API Endpoints Added
* `POST /api/trips`
* `GET /api/trips`
* `PUT /api/trips/{id}`
* `POST /api/trips/{tripId}/days/{dayNumber}/activities`
* `GET /api/destinations?state={state}`

### Files Added
* `TripServiceImpl.java`
* `DestinationServiceImpl.java`
* `GeminiClient.java`
* `WikipediaClient.java`
* `Planner.jsx`
* `DestinationsPage.jsx`
* `dashboardService.js` (refactored to use the shared Axios client)

---

## Lessons Learned & Troubleshooting
* **Missing Itinerary Mappings**: When editing trip details or retrieving a trip by ID, itineraries and activities originally disappeared because the response builder was missing mapper configurations. Added mapper logic to `getTripById` and `updateTrip` in `TripServiceImpl.java`.
* **Wikipedia 403 blocks**: Wikipedia blocked API requests with 403 Forbidden errors due to missing request headers. Resolved by configuring a unique `User-Agent` string in `WikipediaClient.java`.
* **Gemini Offline Failures**: In offline environments, the destinations search threw `UnknownHostException` errors. Resolved by adding a fallback mock generator that serves precompiled local landmark data for Goa, Kerala, Delhi, and other states.
