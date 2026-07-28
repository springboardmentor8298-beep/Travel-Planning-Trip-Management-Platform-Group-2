import api from "./api";

// Get activities of an itinerary
export const getActivitiesByItinerary = async (itineraryId) => {

    const response = await api.get(`/activities/itinerary/${itineraryId}`);

    return response.data;

};

// Create activity
export const createActivity = async (activityData) => {

    const response = await api.post("/activities", activityData);

    return response.data;

};

export const updateActivity = async (id, activityData) => {

    const response = await api.put(`/activities/${id}`, activityData);

    return response.data;

};

export const deleteActivity = async (id) => {

    await api.delete(`/activities/${id}`);

};