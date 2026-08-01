import API from "./api";

export const uploadDocument = (tripId, file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    return API.post(`/trips/${tripId}/documents/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const getTripDocuments = (tripId) => {
    return API.get(`/trips/${tripId}/documents`);
};

export const deleteDocument = (documentId) => {
    return API.delete(`/documents/${documentId}`);
};

export const downloadDocument = (documentId) => {
    return API.get(`/documents/${documentId}/download`, {
        responseType: "blob"
    });
};
