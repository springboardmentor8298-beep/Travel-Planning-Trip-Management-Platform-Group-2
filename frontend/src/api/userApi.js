import axiosClient from "./axiosClient";

export const userApi = {
  getMyProfile: () => axiosClient.get("/users/me"),
  updateMyProfile: (data) => axiosClient.put("/users/me", data),
  getUserCount: () => axiosClient.get("/users/count"),
};
