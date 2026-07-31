# 15. Project Learning Notes & Interview Preparation

This section acts as a study guide for students and developers to prepare for technical interviews based on the TripNest codebase.

---

## Architectural Lessons & Trade-offs

### 1. State Persistence Model
* **What we learned**: Synchronizing database updates with local React state. Originally, the UI updated locally, causing state mismatch on refresh. We refactored it to make API calls, trigger a database save, and reload context.
* **Trade-off**:
  * *Advantages*: Guaranteed data consistency. Page refreshes do not result in data loss.
  * *Disadvantages*: Slightly higher network overhead because updates require a PUT request followed by a GET query.
  * *Alternative*: Optimistic updates, where the UI updates instantly and rolls back only if the API call fails. We chose standard async resolution for simpler state management.

### 2. External API Integration (Gemini & Wikipedia)
* **What we learned**: External dependencies are highly volatile. Without offline fallbacks, network issues or API outages can crash critical parts of the application.
* **Trade-off**:
  * *Advantages*: Resilient code. The app is fully testable offline using the mock destination generator in `GeminiClient.java`.
  * *Disadvantages*: Hardcoded fallback lists increase jar bundle size and require manual updates to support more states.

---

## Typical Technical Interview Questions

### Q1: Why did you choose stateless JWT authentication over session-based state?
* **Answer**: "Stateless JWT authentication helps scale the application since the server does not need to store session records in memory or database tables. The server validates incoming requests by checking the cryptographic signature of the token, allowing us to deploy multiple backend nodes behind a load balancer without needing session replication."

### Q2: How does MapStruct differ from reflection-based mappers like ModelMapper?
* **Answer**: "MapStruct generates standard Java mapping methods at compile-time. Because it writes normal code (like setters and getters), there is no reflection overhead at runtime, resulting in faster conversions and type safety during compilation."

### Q3: What is the purpose of the CORS preflight OPTIONS request?
* **Answer**: "The OPTIONS preflight request is sent by the browser before making cross-origin requests that could affect resource state (like POST or PUT). It checks if the server permits the origin and headers before sending the actual request. If the server rejects the preflight check, the browser blocks the request."
