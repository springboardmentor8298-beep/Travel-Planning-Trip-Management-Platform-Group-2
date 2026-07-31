# 16. Milestone 1 Documentation

## Objectives
* Setup project builds for both backend and frontend.
* Establish the database schema and Hibernate mappings.
* Implement stateless authentication using Spring Security and JWT.
* Enable cross-origin resource sharing (CORS) for the frontend origin.

---

## Features Implemented
1. **Maven Project Initialization**: Configured compile bindings for Lombok, MapStruct, and JPA annotations.
2. **Database Schema Creation**: Created MySQL tables and configured foreign key constraints.
3. **Register/Login REST APIs**: Built auth controllers and service layers with BCrypt password encoding.
4. **CORS Configuration Source**: Added filters in `CorsConfig` to permit preflight validation checks.
5. **Axios Client Interceptors**: Built the `api.js` client with request interceptors to automatically attach JWT tokens.

---

## Technical Details

### Database Changes
* Created the `users` table to store credentials and profile data.
* Created the `trips` table to store travel dates, names, member counts, and foreign keys.

### Files Added
* `SecurityConfig.java`
* `JwtAuthenticationFilter.java`
* `JwtTokenProvider.java`
* `AuthController.java`
* `UserServiceImpl.java`
* `User.java`
* `Trip.java`
* `UserMapper.java`
* `api.js`
* `AuthPage.jsx`

---

## Lessons Learned & Troubleshooting
* **MapStruct Start Crashes**: Encountered compilation conflicts during startup because MapStruct could not locate Lombok methods. Resolved by adding `lombok-mapstruct-binding` in the Maven compiler plugin configuration.
* **Preflight OPTIONS Failures**: OPTIONS preflight checks initially failed with `401 Unauthorized` errors. Resolved by configuring a custom `CorsConfigurationSource` bean and passing it directly to Spring Security to handle requests before authentication filters.
