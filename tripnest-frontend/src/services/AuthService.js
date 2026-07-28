import axios from "axios";

const BASE_URL = "http://localhost:8080/api/auth";

export const loginUser = (user) => axios.post(`${BASE_URL}/login`, user);
export const registerUser = (user) => axios.post(`${BASE_URL}/signup`, user);
