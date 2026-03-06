// ===== Authentication Service =====
// Backend-backed auth with localStorage session persistence

import { apiLogin, apiRegister, apiListUsers } from './api';

const SESSION_KEY = 'tetherx_session';

// Login — calls backend /api/auth/login
export const login = async (email, password) => {
    try {
        const data = await apiLogin(email, password);
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

// Register — calls backend /api/auth/register (requires auth token)
export const register = async (userData) => {
    try {
        const data = await apiRegister(userData);
        return { success: true, user: data.user, message: data.message };
    } catch (err) {
        return { success: false, error: err.message || 'Registration failed' };
    }
};

// Get current session from localStorage
export const getSession = () => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session.token || !session.user) return null;
        return session;
    } catch {
        return null;
    }
};

// Logout
export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

// Get all users (staff calls)
export const getUsers = async () => {
    try {
        const data = await apiListUsers();
        return data.users || [];
    } catch {
        return [];
    }
};

// Stub for compatibility — email verification is no longer client-side
export const verifyEmail = () => ({ success: true, message: 'Verified' });
export const resendVerification = () => ({ success: true });
export const updateUserProfile = () => ({ success: true });
