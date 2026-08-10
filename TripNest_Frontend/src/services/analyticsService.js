import API from "./api";

export const getAnalyticsOverview = () => {
    return API.get("/analytics/overview");
};
