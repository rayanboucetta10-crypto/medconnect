import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Doctors
export const doctorsAPI = {
  list: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  getReviews: (id) => api.get(`/doctors/${id}/reviews`),
  getSpecialties: () => api.get('/doctors/specialties'),
  getCities: () => api.get('/doctors/cities'),
};

// Consultations
export const consultationsAPI = {
  create: (data) => api.post('/consultations', data),
  getMine: (params) => api.get('/consultations/mine', { params }),
  update: (id, data) => api.put(`/consultations/${id}`, data),
};

// Conversations / Messages
export const messagesAPI = {
  getConversations: () => api.get('/conversations'),
  findOrCreate: (otherId) => api.post('/conversations/find-or-create', { otherId }),
  getMessages: (convId, params) => api.get(`/conversations/${convId}/messages`, { params }),
  sendMessage: (convId, data) => api.post(`/conversations/${convId}/messages`, data),
};

// Reviews
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getForDoctor: (id) => api.get(`/reviews/doctor/${id}`),
};

// Upload
export const uploadAPI = {
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
