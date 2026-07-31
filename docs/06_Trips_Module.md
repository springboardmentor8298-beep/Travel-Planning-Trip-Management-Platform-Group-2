# 06. Trips Module

## Overview
The **Trips Module** is the core functional area of TripNest. It tracks travel details, coordinates nested budget structures, and stores associations for itinerary schedules and destinations.

---

## Technical Architecture

### 1. Database Entity (`Trip.java`)
A trip is a highly relational entity containing several mapping attributes:
* **`id`**: Primary Key (Auto-Increment).
* **`tripName`**: The customized title of the trip.
* **`startDate` / `endDate`**: LocalDate timestamps defining the travel window.
* **`notes`**: Custom descriptive text field.
* **`user`**: `@ManyToOne` association linking the trip to its owner.
* **`destinations`**: `@OneToMany` list representing the destinations included.
* **`itineraries`**: `@OneToMany` list containing the planned days.
* **`budget`**: `@OneToOne` reference mapping the associated wallet and expenses.

---

## API Lifecycle Operations

### 1. Create Trip (`POST /api/trips`)
* **Request Payload**: `CreateTripRequest` containing trip name, dates, budget, total members, destination name, city, state, and country.
* **Backend Processing**:
  1. Retrieves the authenticated user from the Security context.
  2. Instantiates a new `Trip` entity.
  3. Instantiates a `Budget` entity with the specified initial budget limit and binds it (`trip.setBudget(budget)`).
  4. Instantiates a `Destination` entity (using destination name, city, state, country) and links it.
  5. Dynamically generates empty `Itinerary` entities for each day between the `startDate` and `endDate` so the user has blank days ready to fill.
  6. Saves the parent `Trip` entity, which cascades and persists all child objects.
* **Response DTO**: `TripResponse`.

### 2. Fetch Trips (`GET /api/trips`)
* **Backend Processing**: Retrieves all trips associated with the authenticated user's ID. Maps the results to a list of `TripResponse` objects.
* **Response Payload**: `ApiResponse<List<TripResponse>>`.

### 3. Update Trip (`PUT /api/trips/{id}`)
* **Request Payload**: `UpdateTripRequest`.
* **Backend Processing**:
  1. Finds the existing trip.
  2. Updates metadata fields (name, dates, notes, description).
  3. Updates the associated destination details.
  4. Adjusts the associated budget limits and recalculates the remaining balance.
  5. Re-saves the trip to the database.

---

## Frontend State Sync & Context Actions

### Trip Creation in React Context (`AppContext.jsx`)
In `AppContext.jsx`, trip creation and state updates call the backend and sync local memory:
```javascript
  const updateTrip = async (tripId, updatedFields) => {
    const t = trips.find(trip => trip.id === tripId);
    if (!t) return;

    const hasBackendFields = 'notes' in updatedFields || 'title' in updatedFields || 'startDate' in updatedFields || 'endDate' in updatedFields || 'totalMembers' in updatedFields || 'description' in updatedFields || 'coverImage' in updatedFields || 'destination' in updatedFields || 'budget' in updatedFields;

    if (hasBackendFields) {
      try {
        const payload = {
          tripName: updatedFields.title || t.title || t.tripName,
          startDate: updatedFields.startDate || t.startDate,
          endDate: updatedFields.endDate || t.endDate,
          totalMembers: Number(updatedFields.totalMembers || t.totalMembers || 1),
          notes: updatedFields.notes !== undefined ? updatedFields.notes : t.notes,
          description: updatedFields.description !== undefined ? updatedFields.description : t.description,
          coverImage: updatedFields.coverImage !== undefined ? updatedFields.coverImage : t.coverImage,
          destinationName: updatedFields.destination || t.destination || t.destinationName || "",
          city: updatedFields.city || t.city || t.destination || "",
          state: updatedFields.state || t.state || "India",
          country: updatedFields.country || t.country || "India",
          budget: Number(updatedFields.budget || t.budget || 0)
        };

        await updateTripApi(tripId, payload);
        await loadTrips();
        triggerNotification("Trip updated successfully!", "success");
      } catch (error) {
        console.error("Failed to update trip on backend:", error);
      }
    }
  };
```
This design maintains a single source of truth in the database while updating the UI state immediately.
