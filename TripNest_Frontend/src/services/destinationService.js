import API from "./api";

/**
 * Fetches 10 travel destinations for a given Indian state from the backend.
 * @param {string} state - The state name in India.
 * @returns {Promise<object>} The API response containing success, message, and data fields.
 */
export const getDestinations = async (state) => {
    const response = await API.get("/destinations", {
        params: {
            country: "India",
            state: state
        }
    });
    return response.data;
};
