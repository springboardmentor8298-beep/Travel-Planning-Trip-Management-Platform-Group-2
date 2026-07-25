import API from "./api";

export const createTrip = (data) => API.post("/trips", data);

export const getMyTrips = () => API.get("/trips");

export const getTripById = (id) => API.get(`/trips/${id}`);

export const updateTrip = (id, data) => API.put(`/trips/${id}`, data);

export const deleteTrip = (id) => API.delete(`/trips/${id}`);