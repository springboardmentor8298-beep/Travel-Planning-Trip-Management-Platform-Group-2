import api from "./api";

// Get itineraries of a trip
export const getItinerariesByTrip = async (tripId) => {

    const response = await api.get(`/itineraries/trip/${tripId}`);

    return response.data;

};

// Create itinerary
export const createItinerary = async (itineraryData) => {

    const response = await api.post("/itineraries", itineraryData);

    return response.data;

};