# 03. Backend Architecture

## Codebase Layout
The backend is structured into domain-specific packages that enforce separation of concerns.

```
com.tripnest.backend/
├── client/          # External API Clients
├── config/          # Global Spring Configuration Beans
├── controller/      # API RestControllers
├── dto/             # Data Transfer Objects (Requests & Responses)
├── entity/          # JPA Database Entities
├── exception/       # Exception handlers and custom exceptions
├── mapper/          # MapStruct compile-time mappings
├── repository/      # Spring Data JPA repositories
├── security/        # JWT Filters, Token providers, details services
└── service/         # Service interfaces & service implementation classes
```

---

## Package Breakdown & Responsibilities

### 1. `controller`
* **Purpose**: Declares REST endpoints, maps URL paths, and parses query parameters.
* **Key Classes**:
  * `AuthController`: Public endpoints for register/login.
  * `UserController`: Encapsulates user profile fetch and updates.
  * `TripController`: Manages trip lifecycle CRUD.
  * `ItineraryController`: Coordinates daily schedules.
  * `ExpenseController`: Manages trip-related financial logging.
  * `DestinationController`: Serves AI destination searches.
* **Responsibilities**: Reads incoming payloads, performs bean validations using `@Valid`, triggers service layers, and returns standardized `ApiResponse` objects.

### 2. `service` & `service.impl`
* **Purpose**: Implements core business logic.
* **Key Classes**:
  * `TripServiceImpl`: Calculates budgets, processes dates, and cascades deletions.
  * `UserServiceImpl`: Hashes passwords, checks duplicate usernames, and manages User profiles.
  * `DestinationServiceImpl`: Invokes GeminiClient and WikipediaClient, merging their results.
  * `ItineraryServiceImpl`: Coordinates travel dates.
* **Responsibilities**: Evaluates security constraints, manages JPA database transactions, maps models, and executes calculations.

### 3. `repository`
* **Purpose**: Database access layer.
* **Key Classes**:
  * `UserRepository`, `TripRepository`, `ItineraryRepository`, `ActivityRepository`, `BudgetRepository`, `ExpenseRepository`.
* **Responsibilities**: Extends `JpaRepository` to provide standard CRUD out of the box. Declares custom queries, such as `findByUserAndTrip()` or `findByEmail()`.

### 4. `entity`
* **Purpose**: Represents MySQL database tables as Java classes.
* **Key Classes**:
  * `User`, `Trip`, `Destination`, `Itinerary`, `Activity`, `Budget`, `Expense`.
* **Responsibilities**: Annotated with `@Entity`, `@Table`, and relationship mapping annotations (`@OneToMany`, `@ManyToOne`, `@OneToOne`). Defines cascade behaviors.

### 5. `dto`
* **Purpose**: Decouples the database schema from the API response payload.
* **Key Classes**:
  * Requests: `LoginRequest`, `RegisterRequest`, `CreateTripRequest`, `UpdateTripRequest`.
  * Responses: `AuthResponse`, `TripResponse`, `ItineraryResponse`, `ActivityResponse`, `DashboardResponse`, `DestinationResponse`.
* **Responsibilities**: POJOs defining the exact serialization properties. Annotated with validations (e.g. `@NotBlank`, `@NotNull`).

### 6. `mapper`
* **Purpose**: Compiles high-performance object mappings.
* **Key Classes**:
  * `UserMapper`: Maps requests/entities to user DTOs.
* **Responsibilities**: Uses MapStruct annotations (`@Mapper`) to generate boilerplate converter classes at compile-time, matching matching names (e.g. `UserMapperImpl.class`).

### 7. `client`
* **Purpose**: Handles outbound web service calls.
* **Key Classes**:
  * `GeminiClient`: Communicates with Google's generative models.
  * `WikipediaClient`: Queries page summaries from the English Wikipedia REST API.
* **Responsibilities**: Encapsulates connection pools, request headers, error catchers, and retry loops.

### 8. `security`
* **Purpose**: Implements user authorization.
* **Key Classes**:
  * `JwtAuthenticationFilter`: Extracts and validates request tokens.
  * `JwtTokenProvider`: Creates, parses, and validates JWT strings.
* **Responsibilities**: Populates Spring Security contexts and intercepts unauthenticated requests.

### 9. `exception`
* **Purpose**: Intercepts and formats errors.
* **Key Classes**:
  * `GlobalExceptionHandler`: Annotated with `@RestControllerAdvice`.
* **Responsibilities**: Catches exceptions globally, formatting them into user-friendly `ApiResponse` objects with corresponding HTTP statuses.
