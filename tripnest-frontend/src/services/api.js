import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let refreshPromise = null;
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original?._retry && localStorage.getItem("refreshToken")) {
            original._retry = true;
            try {
                refreshPromise ??= axios.post("http://localhost:8080/api/auth/refresh", { refreshToken: localStorage.getItem("refreshToken") });
                const { data } = await refreshPromise;
                localStorage.setItem("token", data.token);
                localStorage.setItem("refreshToken", data.refreshToken);
                original.headers.Authorization = `Bearer ${data.token}`;
                return api(original);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                if (window.location.pathname !== "/login") window.location.assign("/login");
            } finally { refreshPromise = null; }
        } else if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            if (window.location.pathname !== "/login") window.location.assign("/login");
        }
        return Promise.reject(error);
    },
);

export default api;
