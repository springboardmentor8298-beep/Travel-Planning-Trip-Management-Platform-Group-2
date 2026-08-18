import axiosClient from "./axiosClient";

/** List all documents for a trip */
export const getDocuments = (tripId) =>
  axiosClient.get(`/trips/${tripId}/documents`);

/**
 * Upload a document
 * @param {number} tripId
 * @param {File}   file
 * @param {string} docType  — TICKET | HOTEL_BOOKING | PASSPORT | VISA | INSURANCE | PHOTO | OTHER
 * @param {string} description
 */
export const uploadDocument = (tripId, file, docType = "OTHER", description = "") => {
  const form = new FormData();
  form.append("file", file);
  form.append("docType", docType);
  form.append("description", description);
  return axiosClient.post(`/trips/${tripId}/documents`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** Delete a document by id */
export const deleteDocument = (tripId, docId) =>
  axiosClient.delete(`/trips/${tripId}/documents/${docId}`);
