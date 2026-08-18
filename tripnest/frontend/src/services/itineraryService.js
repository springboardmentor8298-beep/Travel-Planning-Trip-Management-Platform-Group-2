import api from "./api";

const itineraryService = {

    // ==========================================
    // ITINERARY
    // ==========================================

    // Get all itinerary days of a trip
    getTripItineraries(tripId) {
        return api.get(
            `/itineraries/trip/${tripId}`
        );
    },

    // Get one itinerary
    getItinerary(id) {
        return api.get(
            `/itineraries/${id}`
        );
    },

    // Create itinerary day
    createItinerary(itinerary) {
        return api.post(
            "/itineraries",
            itinerary
        );
    },

    // Update itinerary
    updateItinerary(id, itinerary) {
        return api.put(
            `/itineraries/${id}`,
            itinerary
        );
    },

    // Delete itinerary
    deleteItinerary(id) {
        return api.delete(
            `/itineraries/${id}`
        );
    },


    // ==========================================
    // ACTIVITIES
    // ==========================================

    // Get activities for an itinerary
    getActivities(itineraryId) {
        return api.get(
            `/activities/itinerary/${itineraryId}`
        );
    },

    // Create activity
    createActivity(activity) {
        return api.post(
            "/activities",
            activity
        );
    },

    // Get one activity
    getActivity(id) {
        return api.get(
            `/activities/${id}`
        );
    },

    // Update activity
    updateActivity(id, activity) {
        return api.put(
            `/activities/${id}`,
            activity
        );
    },

    // Delete activity
    deleteActivity(id) {
        return api.delete(
            `/activities/${id}`
        );
    }

};

export default itineraryService;