import api from "./api";

export const createActivity = (tripId, dayNumber, activity) => {
    return api.post(
        `/trips/${tripId}/days/${dayNumber}/activities`,
        activity
    );
};

export const updateActivity = (activityId, activity) => {
    return api.put(
        `/trips/activities/${activityId}`,
        activity
    );
};

export const deleteActivity = (activityId) => {
    return api.delete(
        `/trips/activities/${activityId}`
    );
};