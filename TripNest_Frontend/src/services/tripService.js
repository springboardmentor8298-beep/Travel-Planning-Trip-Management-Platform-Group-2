import API from "./api";

export const createTrip = (data) => API.post("/trips", data);

export const getMyTrips = (search, status, sort) => {
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (sort) params.sort = sort;
    return API.get("/trips", { params });
};

export const getTripById = (id) => API.get(`/trips/${id}`);

export const updateTrip = (id, data) => API.put(`/trips/${id}`, data);

export const deleteTrip = (id) => API.delete(`/trips/${id}`);