import API from "./api";

export const inviteMember = (tripId, memberData) => {
    return API.post(`/trips/${tripId}/members/invite`, memberData);
};

export const removeMember = (tripId, memberId) => {
    return API.delete(`/trips/${tripId}/members/${memberId}`);
};

export const getMembers = (tripId) => {
    return API.get(`/trips/${tripId}/members`);
};

export const acceptInvitation = (memberId) => {
    return API.post(`/trips/members/${memberId}/accept`);
};

export const declineInvitation = (memberId) => {
    return API.post(`/trips/members/${memberId}/decline`);
};

export const getPendingInvitations = () => {
    return API.get("/trips/members/pending");
};
