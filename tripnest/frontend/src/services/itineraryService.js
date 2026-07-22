import api from "./api";

const itineraryService = {

    // Get all itinerary days of a trip
    getTripItineraries(tripId) {
        return api.get(`/itineraries/trip/${tripId}`);
    },

    // Get one itinerary
    getItinerary(id) {
        return api.get(`/itineraries/${id}`);
    },

    // Create itinerary day
    createItinerary(itinerary) {
        return api.post("/itineraries", itinerary);
    },

    // Update itinerary
    updateItinerary(id, itinerary) {
        return api.put(`/itineraries/${id}`, itinerary);
    },

    // Delete itinerary
    deleteItinerary(id) {
        return api.delete(`/itineraries/${id}`);
    }

};

export default itineraryService;