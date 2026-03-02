const API_BASE = 'http://localhost:4000/api';

function getToken() {
    return localStorage.getItem('divyadarshan_token');
}

function getUser() {
    const u = localStorage.getItem('divyadarshan_user');
    return u ? JSON.parse(u) : null;
}

function setAuth(token, user) {
    localStorage.setItem('divyadarshan_token', token);
    localStorage.setItem('divyadarshan_user', JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem('divyadarshan_token');
    localStorage.removeItem('divyadarshan_user');
}

function isLoggedIn() {
    return !!getToken();
}

async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
}

// Auth
export async function signup(name, email, phone, password) {
    const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password })
    });
    setAuth(data.token, data.user);
    return data;
}

export async function login(email, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    setAuth(data.token, data.user);
    return data;
}

export function logout() {
    clearAuth();
    window.location.hash = '#/';
}

// OTP Auth
export async function sendOtp(identifier) {
    return apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier })
    });
}

export async function verifyOtp(identifier, otp) {
    const data = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier, otp })
    });
    setAuth(data.token, data.user);
    return data;
}

// Temples
export async function getTemples(search = '', category = '') {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    const q = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/temples${q}`);
}

export async function getCategories() {
    return apiRequest('/temples/categories');
}

export async function getTempleById(id) {
    return apiRequest(`/temples/${id}`);
}

export async function getTempleStatus(id) {
    return apiRequest(`/temples/${id}/status`);
}

export async function getNearbyPlaces(id, radius = 50) {
    return apiRequest(`/temples/${id}/nearby?radius=${radius}`);
}

// Bookings
export async function createBooking(bookingData) {
    return apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
    });
}

export async function getMyBookings() {
    return apiRequest('/bookings/my');
}

export { getUser, isLoggedIn, getToken };
