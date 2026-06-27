import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In development, the Vite proxy forwards /api → localhost:5000.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
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
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
  update:   (data) => api.put('/auth/profile', data),
};

// Doctors
export const doctorsAPI = {
  list:         (params) => api.get('/doctors', { params }),
  getById:      (id)     => api.get(`/doctors/${id}`),
  update:       (id, data) => api.put(`/doctors/${id}`, data),
  getReviews:   (id)     => api.get(`/doctors/${id}/reviews`),
  getSpecialties: ()     => api.get('/doctors/meta/specialties'),
  getCities:    ()       => api.get('/doctors/meta/cities'),
};

// Consultations
export const consultationsAPI = {
  create:  (data) => api.post('/consultations', data),
  mine:    (params) => api.get('/consultations/mine', { params }),
  update:  (id, data) => api.put(`/consultations/${id}`, data),
};

// Messages / Conversations
export const conversationsAPI = {
  list:           ()         => api.get('/conversations'),
  getOrCreate:    (otherId)  => api.post('/conversations/get-or-create', { otherId }),
  getMessages:    (id, params) => api.get(`/conversations/${id}/messages`, { params }),
  sendMessage:    (id, data) => api.post(`/conversations/${id}/messages`, data),
};

// Reviews
export const reviewsAPI = {
  create:       (data) => api.post('/reviews', data),
  forDoctor:    (id)   => api.get(`/reviews/doctor/${id}`),
};

// Upload
export const uploadAPI = {
  file: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Backward-compat alias (some components use messagesAPI)
export const messagesAPI = {
  getConversations: ()         => conversationsAPI.list(),
  findOrCreate:     (otherId)  => conversationsAPI.getOrCreate(otherId),
  getMessages:      (id, p)    => conversationsAPI.getMessages(id, p),
  sendMessage:      (id, data) => conversationsAPI.sendMessage(id, data),
};
