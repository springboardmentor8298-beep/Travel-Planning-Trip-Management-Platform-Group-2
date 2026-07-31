# 12. Complete Request & Response Lifecycle Flow

To help developers trace executions, here is the complete end-to-end flow of an API request. We use the **"Update Trip Notes"** action as an example.

---

## The Lifecycle Steps

### Step 1: User Action on Frontend
1. The user type notes inside the text area on `TripDetails.jsx`.
2. The user clicks **Save Notes**.
3. The React page calls context function `updateTrip(tripId, { notes: notesText })`.

### Step 2: Context Evaluation & API Dispatch
1. `AppContext.jsx` detects that `notes` is a database-supported attribute.
2. It compiles a payload merging current trip data with new notes.
3. It calls `updateTrip` inside `tripService.js`:
```javascript
export const updateTrip = (id, data) => API.put(`/trips/${id}`, data);
```
4. Axios intercepts the request:
   * Attaches `Authorization: Bearer <JWT_Token>` to request headers.
   * Dispatches the HTTP PUT request to `http://localhost:8081/api/trips/{id}`.

### Step 3: Backend Security Interception
1. The servlet container receives the request.
2. `CorsFilter` verifies the origin (`http://localhost:5173`) and allows preflight headers.
3. `JwtAuthenticationFilter` intercepts the request:
   * Extracts the Bearer token.
   * Calls `JwtTokenProvider` to validate signature and extract username (`user@example.com`).
   * Authenticates the user in the security context.

### Step 4: Controller Layer
1. The request reaches `TripController.java`:
```java
    @PutMapping("/{id}")
    public ApiResponse<TripResponse> updateTrip(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTripRequest request) {
        return tripService.updateTrip(id, request);
    }
```
2. The `@Valid` annotation checks constraints on the DTO. If invalid, a `MethodArgumentNotValidException` is thrown and caught by `GlobalExceptionHandler`.

### Step 5: Service Implementation Layer
1. `TripServiceImpl.java` executes `updateTrip`:
   * Retrieves the trip entity using `tripRepository.findById(id)`.
   * Verifies the trip belongs to the authenticated user.
   * Updates attributes: `trip.setNotes(request.getNotes())`.
   * Saves updates using `tripRepository.save(trip)`.

### Step 6: JPA & Hibernate Persistence
1. Hibernate generates an SQL query:
```sql
UPDATE trips SET notes = ?, trip_name = ? WHERE id = ?;
```
2. Transacts the change with the MySQL database.

### Step 7: Response Mapping & Return
1. `TripServiceImpl` maps the updated `Trip` entity to a new `TripResponse` DTO (including itineraries).
2. Wraps it in `ApiResponse.success` and returns it.
3. The backend serialization converts the Java DTO into JSON and returns it with a `200 OK` status.

### Step 8: Frontend State Refresh
1. Axios receives the JSON response.
2. Context triggers `loadTrips()`, calling `getMyTrips()` from the backend to refresh the global state.
3. React re-renders components, showing the updated notes.
