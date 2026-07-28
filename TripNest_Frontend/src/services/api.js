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

export default API;