// ===== Authentication Service =====
// Backend-backed auth with JWT tokens stored in localStorage

import { apiLogin } from './api';

const SESSION_KEY = 'tetherx_session';

// Login — calls backend /api/auth/login
export const login = async (email, password) => {
    try {
        const data = await apiLogin(email, password);
        // data = { token, user: { id, name, email, role, department } }
        const session = {
            token: data.token,
            user: data.user,
            loginAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, user: data.user };
    } catch (err) {
        return { success: false, error: err.message || 'Invalid email or password' };
    }
};

// Register — handled via api.js apiRegister (requires auth token)
export const register = async (userData) => {
    const { apiRegister } = await import('./api');
    try {
        const data = await apiRegister(userData);
        return { success: true, user: data };
    } catch (err) {
        return { success: false, error: err.message || 'Registration failed' };
    }
};

// Get current session
export const getSession = () => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

// Logout
export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

// Update user in session
export const updateUserProfile = (userId, updates) => {
    const session = getSession();
    if (!session?.user || session.user.id !== userId) {
        return { success: false, error: 'User not found' };
    }
    session.user = { ...session.user, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session.user };
};

// Stubs for unused verify flows
export const verifyEmail = async () => ({ success: true });
export const resendVerification = async () => ({ success: true });
