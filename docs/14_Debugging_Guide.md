# 14. Project Debugging Guide

This handbook is designed to help developers identify, diagnose, and resolve runtime errors, network failures, and build issues in the TripNest project.

---

## Troubleshooting Guide

### 1. `BeanCreationException` (e.g. `Error creating bean 'userMapperImpl'`)
* **Symptom**: Spring Boot application crashes during startup.
* **Root Cause**: The compiler generated code for mappers before Lombok created getter/setter classes, resulting in MapStruct failing to find matching methods.
* **How to Identify**: Review the Maven console log during `mvn clean compile` for annotation processor warnings.
* **How to Fix**: Bind the Lombok and MapStruct compile-time dependency order in `pom.xml`:
```xml
<annotationProcessorPaths>
    <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>${lombok.version}</version>
    </path>
    <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok-mapstruct-binding</artifactId>
        <version>0.2.0</version>
    </path>
    <path>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct-processor</artifactId>
        <version>${mapstruct.version}</version>
    </path>
</annotationProcessorPaths>
```
* **How to Prevent**: Always use `mvn clean compile` to compile project classes from scratch rather than relying on IDE incremental compilation.

---

### 2. `UnknownHostException` (e.g. `generativelanguage.googleapis.com`)
* **Symptom**: Destinations search displays "Something went wrong" or takes a long time before throwing errors.
* **Root Cause**: The host machine is offline or blocked from making queries to Google API endpoints.
* **How to Identify**: Check the console logs for `java.net.UnknownHostException`.
* **How to Fix**: The `GeminiClient` now includes a fallback mechanism that automatically redirects calls to `getMockDestinations(state)` on network errors, generating structured local destination lists.
* **How to Prevent**: Verify network adapters and API keys, and test offline queries to verify the fallback triggers correctly.

---

### 3. Port Already in Use (`8081` occupied)
* **Symptom**: Starting the backend fails with `Port 8081 is already occupied`.
* **Root Cause**: An active Spring Boot instance or local service is already listening on port 8081.
* **How to Identify**: Run this command in Windows PowerShell:
```powershell
netstat -ano | findstr :8081
```
* **How to Fix**: Kill the process using the PID found from the netstat command:
```powershell
taskkill /PID <PID_NUMBER> /F
```
Alternatively, change the port in `application.properties`:
```properties
server.port=8083
```

---

### 4. `401 Unauthorized` Loop
* **Symptom**: User logs in but is immediately kicked out to the auth screen.
* **Root Cause**: The backend JWT provider uses a signing key or issuer string that does not match what the interceptor expects, or the Axios client fails to attach the header prefix correctly.
* **How to Identify**: Inspect request headers in the browser's Network tab. Verify the `Authorization` header is in the format: `Bearer <JWT_String>`.
* **How to Fix**: Verify the secret key in `application.properties` matches. Inspect `api.js` request interceptor logic.

---

### 5. `CORS Block` (Cross-Origin Resource Sharing)
* **Symptom**: Frontend console reports `Blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present`.
* **Root Cause**: Spring Security intercepted and blocked a preflight `OPTIONS` request before it reached the CORS configurations.
* **How to Identify**: Network tab shows failed OPTIONS request with a `401` or `403` status.
* **How to Fix**: Configure a custom `CorsConfigurationSource` bean and pass it to Spring Security:
```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
```
This ensures preflight CORS validations are processed at the start of the filter chain.
