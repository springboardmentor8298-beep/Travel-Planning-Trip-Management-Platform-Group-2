import axiosClient from "./axiosClient";

export const getDestinations = (params) =>
  axiosClient.get("/destinations", { params });
export const getDestination = (id) => axiosClient.get(`/destinations/${id}`);
export const createDestination = (data) =>
  axiosClient.post("/destinations", data);
