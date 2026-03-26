import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Parking
export const getSlots = () => API.get('/parking/slots');
export const getAvailability = () => API.get('/parking/availability');

// Booking
export const bookSlot = (data) => API.post('/booking/book', data);
export const getMyBookings = () => API.get('/booking/my');
export const simulateEntry = (data) => API.post('/booking/entry', data);
export const simulateExit = (data) => API.post('/booking/exit', data);
export const cancelBooking = (id) => API.post(`/booking/cancel/${id}`);

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminBookings = () => API.get('/admin/bookings');

// AI
export const getPrediction = () => API.get('/ai/predict');
export const getPricing = () => API.get('/ai/pricing');
export const chatWithAI = (data) => API.post('/ai/chat', data);
export const getSuggestions = () => API.get('/ai/suggestions');

export default API;
