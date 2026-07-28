import api from "./api";

// Get all trips
export const getAllTrips = async () => {
    const response = await api.get("/trips");
    return response.data;
};

// Create trip
export const createTrip = async (tripData) => {
    const response = await api.post("/trips", tripData);
    return response.data;
};

// Get trip by ID
export const getTripById = async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
};

// Update trip
export const updateTrip = async (id, tripData) => {
    const response = await api.put(`/trips/${id}`, tripData);
    return response.data;
};

// Delete trip
export const deleteTrip = async (id) => {
    await api.delete(`/trips/${id}`);
};