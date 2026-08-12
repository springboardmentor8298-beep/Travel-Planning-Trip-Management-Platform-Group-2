# Implementation Plan - TripNest Admin Portal & Analytics Improvements

This implementation plan details the addition of a separate Admin Dashboard module to the TripNest application. All changes are strictly additive and follow the critical safety rules to prevent any regressions.

## User Review Required

> [!IMPORTANT]
> - A new backend endpoint `GET /api/admin/analytics/overview` will be created. It is secured under the existing `/api/admin/**` pattern in `SecurityConfig.java` to restrict access strictly to users with the `ADMIN` role.
> - The Admin Sidebar will be converted to an isolated Admin Workspace when the logged-in user is an `ADMIN`. Traveler-specific features (Itinerary Planner, Destinations, Calendar) will be hidden, and the menu will only contain administration links: Dashboard, Users, Trips, and Analytics.
> - A new DTO `AdminAnalyticsResponse.java` will be created under `com.tripnest.backend.dto.admin`.

---

## Proposed Changes

### Backend Components

#### [NEW] [AdminAnalyticsResponse.java](file:///d:/Projects/Infosys_VI_7.0/TripNest_Backend/src/main/java/com/tripnest/backend/dto/admin/AdminAnalyticsResponse.java)
- Define a DTO with fields for:
  - Trip overview (`totalTrips`, `activeTrips`, `upcomingTrips`, `completedTrips`)
  - Financial overview (`totalBudget`, `totalSpent`, `remainingBudget`, `budgetUtilizationPercentage`)
  - Itinerary overview (`totalEstimatedItineraryCost`)
  - Expense analytics (`expenseCategoryDistribution`)
  - Trip status analytics (`tripStatusDistribution`)
  - User analytics (`totalUsers`)
  - Destination analytics (`destinationDistribution`)

#### [MODIFY] [AdminService.java](file:///d:/Projects/Infosys_VI_7.0/TripNest_Backend/src/main/java/com/tripnest/backend/service/admin/AdminService.java)
- Add the method signature:
  `ApiResponse<AdminAnalyticsResponse> getAnalyticsOverview();`

#### [MODIFY] [AdminServiceImpl.java](file:///d:/Projects/Infosys_VI_7.0/TripNest_Backend/src/main/java/com/tripnest/backend/service/admin/impl/AdminServiceImpl.java)
- Implement `getAnalyticsOverview()`:
  - Inject `TripService` to synchronize trip statuses.
  - Query all trips, calculate platform-wide statuses, budgets, spent amounts, remaining budgets, category expense distributions, and destination counts.
  - Aggregate the user count via `userRepository.count()`.

#### [MODIFY] [AdminController.java](file:///d:/Projects/Infosys_VI_7.0/TripNest_Backend/src/main/java/com/tripnest/backend/controller/admin/AdminController.java)
- Expose the endpoint:
  - `GET /api/admin/analytics/overview` returning `AdminAnalyticsResponse`.

---

### Frontend Components

#### [MODIFY] [adminService.js](file:///d:/Projects/Infosys_VI_7.0/TripNest_Frontend/src/services/adminService.js)
- Expose `getAdminAnalytics()` mapping to `GET /admin/analytics/overview`.

#### [MODIFY] [AdminTrips.jsx](file:///d:/Projects/Infosys_VI_7.0/TripNest_Frontend/src/pages/admin/AdminTrips.jsx)
- Fix the icon crash by importing `Luggage` from `lucide-react` at the top of the file.

#### [MODIFY] [Sidebar.jsx](file:///d:/Projects/Infosys_VI_7.0/TripNest_Frontend/src/components/common/Sidebar.jsx)
- Import the `Users` icon from `lucide-react`.
- Update `navItems` logic to isolate the sidebar for admins. If user is an `ADMIN`, replace traveler navigation items with:
  - Dashboard (id: `'admin'`, matches `/admin/dashboard`)
  - Users (id: `'admin-users'`, matches `/admin/users`)
  - Trips (id: `'admin-trips'`, matches `/admin/trips`)
  - Analytics (id: `'admin-analytics'`, matches `/admin/analytics`)
- Update the workspace section header title to render `'ADMINISTRATION'` when the admin is active.

#### [MODIFY] [App.jsx](file:///d:/Projects/Infosys_VI_7.0/TripNest_Frontend/src/App.jsx)
- Import the new `AdminAnalytics` component.
- Add route path `/admin/analytics` rendering `AppContent` with `initialPage="admin-analytics"`.
- Update active page switch casing to render `<AdminAnalytics setActivePage={setActivePage} />` for case `'admin-analytics'`.
- Update active page URL synchronization and guard redirects to handle the new `'admin-analytics'` route.

#### [NEW] [AdminAnalytics.jsx](file:///d:/Projects/Infosys_VI_7.0/TripNest_Frontend/src/pages/admin/AdminAnalytics.jsx)
- Build a premium dashboard tracking overall platform metrics:
  - Platform trip stats cards (Total, Active, Upcoming, Completed).
  - Financial overview metrics (Total Budget, Total Spent, Remaining, Itinerary Cost).
  - Budget Utilization Ring showing percentage.
  - Expense Category Breakdown list.
  - Custom SVG Donut Chart for trip status distribution.
  - Frequently visited destinations list compiled from database.
  - Refresh Stats button to reload data dynamically without reloading the browser.

---

## Verification Plan

### Automated Tests
- Run `mvn clean compile` to check that the backend builds successfully.
- Run `mvn test` to verify unit tests.
- Run `npm run build` to verify React files compile and build.

### Manual Verification
1. Login as `admin@gmail.com`, check that traveler pages are hidden from the sidebar, and only administration links (Dashboard, Users, Trips, Analytics) display.
2. Verify clicking "Analytics" navigates to `/admin/analytics` and displays real platform statistics. Verify no `Luggage` runtime error on `/admin/trips`.
3. Login as a normal user, verify normal traveler analytics display, and verify that trying to access `/admin/analytics` redirects to `/dashboard`.e.
