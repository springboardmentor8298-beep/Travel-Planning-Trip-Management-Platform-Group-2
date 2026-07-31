# 19. Developer Extension Guide

This guide explains how to safely add new features, pages, entities, controllers, and APIs without breaking the existing TripNest architecture.

---

## 1. Adding a New REST API Endpoint

To add a new API (for example, `/api/travel-insurance`):
1. **Create the Entity**:
   * Add a new Java class in `com.tripnest.backend.entity`.
   * Annotate it with `@Entity` and `@Table`.
   * Establish associations (e.g. `@ManyToOne` linking back to the `Trip` entity).
2. **Create the Repository**:
   * Create an interface in `com.tripnest.backend.repository` extending `JpaRepository`.
3. **Create the DTOs**:
   * Create request and response DTO classes in `com.tripnest.backend.dto`.
4. **Create the Service Layer**:
   * Define the interface in `com.tripnest.backend.service`.
   * Implement it in `com.tripnest.backend.service.impl`.
5. **Create the Controller**:
   * Add a new controller in `com.tripnest.backend.controller` and annotate it with `@RestController`.
   * Secure it by defining permission rules in `SecurityConfig.java` if needed.

---

## 2. Adding a New Frontend Page

To add a new view page (for example, `TravelInsurance.jsx`):
1. **Create the Component**:
   * Create `TravelInsurance.jsx` inside the `src/pages/` directory.
2. **Declare API Functions**:
   * Create `insuranceService.js` inside `src/services/` using the shared Axios client:
```javascript
import API from "./api";
export const getInsuranceQuote = (data) => API.post("/insurance/quote", data);
```
3. **Mount the Route**:
   * Add a Route configuration in `App.jsx` under `<Routes>` if the page needs a unique path:
```javascript
<Route path="/insurance" element={<TravelInsurance />} />
```
   * Alternatively, add it to the page rendering switch block inside `AppContent` in `App.jsx` if using standard layout panels.

---

## 3. Adding a New AI Prompt Module

To introduce a new generative AI feature (for example, generating packing lists based on trip destinations):
1. **Define the DTO**:
   * Create a response class (e.g. `PackingListResponse`) containing lists of items.
2. **Draft the System Prompt**:
   * In `GeminiClient.java`, add a prompt generation method:
```java
String prompt = "Suggest a packing list for a trip to: " + destinationName + ". "
    + "Return strictly as a JSON array of strings.";
```
3. **Add the Client Call**:
   * Call `restClient` in `GeminiClient` matching the payload schema.
   * Add an offline fallback helper returning mock lists to handle connection errors.
4. **Integrate with Service and Controller**:
   * Call the client method from your services and expose it through a REST endpoint (e.g. `/api/trips/{id}/packing-list`).
5. **Update Frontend UI**:
   * Add a checklist component on the frontend to display the packing list.
