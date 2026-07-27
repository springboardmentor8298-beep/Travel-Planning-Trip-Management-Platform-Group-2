import api from './axiosClient';

export const destinationApi = {
  search: (params) => api.get('/destinations', { params }),
  getById: (id) => api.get(`/destinations/${id}`)
};
