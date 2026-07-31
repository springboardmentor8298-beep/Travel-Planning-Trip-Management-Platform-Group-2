import API from "./api";

export const getDashboard = () => {
    return API.get("/dashboard");
};