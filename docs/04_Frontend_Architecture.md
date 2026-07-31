# 04. Frontend Architecture

## Component Hierarchy & Directory Roles
The frontend React project organizes its files into logical subfolders within the `src/` directory.

```
src/
├── components/      # Reusable visual components (Header, Sidebar, Modal)
├── context/         # AppContext (Global State & CRUD actions)
├── data/            # Local fallback seed files (seedData.js)
├── layouts/         # Frame templates (MainLayout)
├── pages/           # Screen views (Dashboard, Trips, Planner, Destinations)
├── services/        # Axios API clients
├── utils/           # Shared formatters (Date, Token, Currency)
├── App.jsx          # Router & Entry Layout
└── main.jsx         # DOM Mounting Node
```

---

## Folder Details & Responsibilities

### 1. `pages/`
Each folder here represents a primary tab/screen in the application.
* **`Dashboard.jsx`**: Displays trip statistics cards (Total Budget, Total Spent, Remaining Capital) and activity feeds. It loads statistics using `getDashboard` from `dashboardService.js`.
* **`Trips.jsx`**: Coordinates trip cards. Supports editing, creating, and deleting trips. Uses a modal pop-up form.
* **`TripDetails.jsx`**: Contains sub-tabs: Overview, Timeline, Budget, and Notes. Captures trip note updates.
* **`Planner.jsx`**: The itinerary planner screen. Allows users to add, edit, or remove daily activities mapped to individual days of a trip.
* **`DestinationsPage.jsx`**: Serves as the "Explore India" screen. Contains a country dropdown and a state search input. On submission, displays generated destination cards.
* **`AuthPage.jsx`**: Combined Login & Registration screen. Uses card-flip transitions.

### 2. `context/`
* **`AppContext.jsx`**: The global state provider.
  * **State variables**: `profile`, `trips`, `activePage`, `activeTripId`, `notifications`.
  * **Actions**: 
    * `loadTrips`: Fetches from backend `getMyTrips()` and formats response data.
    * `updateTrip`: Sends updates to the database via `updateTripApi` for database fields, falling back to local updates for mock fields.
    * `addExpense` / `deleteExpense`: Calls the backend expense APIs.
    * `triggerNotification`: Displays custom snackbars (toast messages).

### 3. `services/`
* **`api.js`**: Defines the shared Axios client.
  * Base URL: `http://localhost:8081/api`.
  * Request Interceptor: Appends the current JWT token from local storage: `config.headers.Authorization = 'Bearer ' + token`.
  * Response Interceptor: Listens for `401 Unauthorized` responses. If a 401 occurs, it clears the token and triggers a page redirection back to the `/` auth screen.
* **`authService.js`**, **`tripService.js`**, **`activityService.js`**, **`dashboardService.js`**: Modular API functions wrapping HTTP calls to specific backend endpoints.

### 4. `utils/`
* **`token.js`**: Manages local storage get/set/remove keys for `tripnest_token`.
* **`date.js`**: Formats date ranges (e.g. `12 Aug - 15 Aug`) and full dates.
* **`currency.js`**: Formats currency numbers into localized formats (e.g. `INR 1,25,000`).

---

## Routing Layout
TripNest uses **React Router DOM v7** to orchestrate routes in [App.jsx](file:///d:/Projects/Infosys_VI_7.0/TripNest_Frontend/src/App.jsx):

```javascript
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<AppContent />} />
        </Routes>
```
* **`/`** & **`/login`**: Directs unauthenticated users to the login/register screen.
* **`/dashboard`**: Renders `<AppContent />` which checks for authentication. If authenticated, it renders the `MainLayout` wrapping the current active page; otherwise, it redirects the user back to the login screen.
