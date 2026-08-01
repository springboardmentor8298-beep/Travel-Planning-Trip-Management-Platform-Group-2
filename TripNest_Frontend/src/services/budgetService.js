import API from "./api";

export const getBudget = (id) => {
    return API.get(`/budgets/${id}`);
};

export const getBudgetByTrip = (tripId) => {
    return API.get(`/budgets/trip/${tripId}`);
};

export const createBudget = (tripId, totalBudget) => {
    return API.post(`/trips/${tripId}/budget`, { totalBudget });
};

export const updateBudget = (id, totalBudget) => {
    return API.put(`/budgets/${id}`, { totalBudget });
};

export const getBudgetSummary = (id) => {
    return API.get(`/budgets/${id}/summary`);
};
