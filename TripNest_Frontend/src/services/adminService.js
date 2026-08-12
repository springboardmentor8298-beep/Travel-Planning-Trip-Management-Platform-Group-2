import API from "./api";

export const getAdminDashboard = () => {
    return API.get("/admin/dashboard");
};

export const getAdminUsers = () => {
    return API.get("/admin/users");
};

export const getAdminUser = (id) => {
    return API.get(`/admin/users/${id}`);
};

export const getAdminTrips = () => {
    return API.get("/admin/trips");
};

export const getAdminTrip = (id) => {
    return API.get(`/admin/trips/${id}`);
};

export const getAdminAnalytics = () => {
    return API.get("/admin/analytics/overview");
};

export const getAdminTripMembers = (tripId) => {
    return API.get(`/admin/trips/${tripId}/members`);
};
