import axiosClient from "./axiosClient";

/* ── Groups ── */
export const getMyGroups        = ()           => axiosClient.get("/groups");
export const createGroup        = (data)       => axiosClient.post("/groups", data);
export const getGroup           = (groupId)    => axiosClient.get(`/groups/${groupId}`);

/* ── Invitations ── */

/** Invite one OR multiple people.  emails is string[] */
export const inviteMembers = (groupId, emails) =>
  axiosClient.post(`/groups/${groupId}/invitations`, {
    emails: Array.isArray(emails) ? emails : [emails],
  });

/** Kept for backwards-compat (single email string → array) */
export const inviteMember = (groupId, email) => inviteMembers(groupId, [email]);

export const getMyPendingInvitations = () =>
  axiosClient.get("/groups/invitations/pending");

export const getGroupInvitations = (groupId) =>
  axiosClient.get(`/groups/${groupId}/invitations`);

export const respondToInvitation = (invitationId, accept) =>
  axiosClient.put(`/groups/invitations/${invitationId}/respond`, { accept });

/* ── Members ── */
export const removeMember = (groupId, memberUserId) =>
  axiosClient.delete(`/groups/${groupId}/members/${memberUserId}`);

/* ── Messages ── */
export const getMessages  = (groupId)          => axiosClient.get(`/groups/${groupId}/messages`);
export const postMessage  = (groupId, content) => axiosClient.post(`/groups/${groupId}/messages`, { content });
