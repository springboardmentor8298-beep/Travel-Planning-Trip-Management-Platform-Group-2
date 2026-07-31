import axios from "axios";
import { getToken } from "../utils/token";

const API = axios.create({
    baseURL: "http://localhost:8081/api",
});

API.interceptors.request.use((config) => {

    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(config.headers.Authorization);

    return config;
});

// Response interceptor to handle expired or invalid JWT tokens (401 Unauthorized)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized request detected. Clearing session and redirecting to login...");
            localStorage.removeItem("token");
            localStorage.removeItem("tripnest_profile");
            localStorage.removeItem("tripnest_trips");
            localStorage.removeItem("tripnest_settings");
            localStorage.removeItem("tripnest_activity");
            
            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default API;