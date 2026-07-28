import API from "./api";

export const getProfile = () => {
    return API.get("/users/profile");
};

export const updateProfile = (profileData) => {
    return API.put("/users/profile", profileData);
};
