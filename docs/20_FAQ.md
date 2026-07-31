# 20. Frequently Asked Questions (FAQ)

Here are answers to common questions about setting up and running the TripNest application.

---

## 1. Why does my frontend build fail after adding new fields?
* **Answer**: Double-check if the new properties are mapped correctly in the backend response DTOs. If the frontend references properties (e.g. `trip.itinerary`) that are not populated in the JSON payload returned by the API, the UI components may fail with undefined rendering errors.

---

## 2. Why does the console print a 404 warning when searching for destinations?
* **Answer**: This warning appears when Wikipedia doesn't have a matching page for a recommended landmark (e.g. `Wikipedia page not found (404) for: INS_Kursura_Submarine_Museum`). The `WikipediaClient` catches this error, logs a clean warning, and returns a null object, allowing the backend to fall back to default descriptions without crashing.

---

## 3. How do I test the Gemini recommendations without an active internet connection?
* **Answer**: You don't need to do anything. If the backend fails to connect to Google's API servers (e.g., due to an `UnknownHostException` or request timeout), `GeminiClient.java` automatically catches the exception and falls back to serving realistic mock destinations for Goa, Kerala, Delhi, and other states.

---

## 4. Why are my JWT tokens expiring immediately?
* **Answer**: Verify the token expiration configuration in your `application.properties` file. If the validity period is set too short (e.g. in milliseconds instead of seconds), tokens will expire almost instantly. Also, ensure your local system clock is synchronized.

---

## 5. Can I change the backend server port to 8082?
* **Answer**: No. The project requirements specify that the backend must run on port `8081`. The frontend services and Axios configurations are hardcoded to communicate with `http://localhost:8081/api`. Changing the port will break all frontend-backend communication.
