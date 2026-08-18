import axiosClient from "./axiosClient";

/** Send a trip invitation to one email */
export const inviteTraveler     = (tripId, email)  =>
  axiosClient.post(`/trips/${tripId}/invitations`, { email });

/** Full invitation history for a trip (PENDING + ACCEPTED + REJECTED) */
export const getTripInvitations = (tripId)          =>
  axiosClient.get(`/trips/${tripId}/invitations`);

/** All pending trip invitations for the logged-in user */
export const getMyPendingTripInvitations = ()       =>
  axiosClient.get("/trips/invitations/pending");

/** Accept or reject a trip invitation */
export const respondTripInvitation = (invId, accept) =>
  axiosClient.put(`/trips/invitations/${invId}/respond`, { accept });
