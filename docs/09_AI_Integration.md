# 09. AI Integration & Prompt Engineering

## Model & API Configuration
TripNest integrates Google's **Gemini API** for semantic recommendations.

* **Authorized Model**: `gemini-3.6-flash`.
* **API Base URL**: `https://generativelanguage.googleapis.com/v1beta`.
* **Timeout Configuration**:
  * Connection Timeout: `5000ms`.
  * Read Timeout: `30000ms` (larger read timeout to accommodate LLM generation latency).

---

## Prompt Design & Constraints
To ensure the API response can be parsed reliably by the backend, the client wraps the user's search inputs in a strict system instruction prompt.

```
Suggest 10 famous tourist destinations in state: [Goa], country: [India].

Return the response strictly as a JSON array where each object has exactly these keys: 'name' and 'famousFor'. 

Do not write markdown blocks, backticks, or HTML. Example:
[
  {"name": "Calangute Beach", "famousFor": "Beaches and water sports"}
]
```

### Prompt Guardrails
1. **JSON Output Enforcement**: Asking the model *not* to wrap the response in markdown blocks (e.g. ` ```json `) prevents Jackson parsing errors.
2. **Schema Control**: Naming the exact keys (`name`, `famousFor`) ensures that MapStruct or Jackson serialization binds to target Java objects without raising unrecognized properties errors.
3. **Truncated Queries**: Values are filtered to remove special characters before interpolation.

---

## Response Parsing Flow
1. The request returns raw JSON.
2. The client extracts the text payload path: `candidates[0].content.parts[0].text`.
3. An `ObjectMapper` parses this text into a list of `GeminiDestination` objects:
```java
ObjectMapper mapper = new ObjectMapper();
List<GeminiDestination> list = mapper.readValue(
    rawText, 
    new TypeReference<List<GeminiDestination>>() {}
);
```

---

## Network Resiliency & Offline Fallback
To prevent the application from throwing errors or crashing when offline or when the Gemini API is unavailable:
1. **Retry Mechanism**: A loop attempts the request up to 3 times, waiting 1 second between attempts.
2. **Exception Handling**: Catches connection exceptions (e.g. `ResourceAccessException`, `UnknownHostException`).
3. **Mock Fallback**: On failure, it falls back to a local data generator that provides realistic landmarks for the searched state, keeping the app functional offline.

```java
    try {
        // HTTP API POST request...
    } catch (Exception e) {
        log.error("Gemini API attempt {} failed: {}", attempt, e.getMessage());
        if (attempt > maxRetries) {
            log.warn("Gemini exhausted. Activating offline fallback.");
            return getMockDestinations(state);
        }
    }
```
