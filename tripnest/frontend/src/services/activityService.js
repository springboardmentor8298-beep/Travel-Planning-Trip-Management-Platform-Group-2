import api from "./api";

const activityService = {

    // Get all activities for an itinerary
    getActivities(itineraryId) {
        return api.get(`/activities/itinerary/${itineraryId}`);
    },

    // Get one activity
    getActivity(id) {
        return api.get(`/activities/${id}`);
    },

    // Create activity
    createActivity(activity) {
        return api.post("/activities", activity);
    },

    // Update activity
    updateActivity(id, activity) {
        return api.put(`/activities/${id}`, activity);
    },

    // Delete activity
    deleteActivity(id) {
        return api.delete(`/activities/${id}`);
    }

};

export default activityService;