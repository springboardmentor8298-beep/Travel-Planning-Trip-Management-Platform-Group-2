import axios from "axios";

const API_URL = "http://localhost:8080/expenses";

const getToken = () => {

    return localStorage.getItem("token");

};

export const createExpense = async (expense) => {

    const response = await axios.post(
        API_URL,
        expense,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );

    return response.data;

};

export const getExpensesByTrip = async (tripId) => {

    const response = await axios.get(
        `${API_URL}/trip/${tripId}`,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );

    return response.data;

};

export const getExpenseById = async (id) => {

    const response = await axios.get(
        `${API_URL}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );

    return response.data;

};

export const updateExpense = async (id, expense) => {

    const response = await axios.put(
        `${API_URL}/${id}`,
        expense,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );

    return response.data;

};

export const deleteExpense = async (id) => {

    await axios.delete(
        `${API_URL}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );

};