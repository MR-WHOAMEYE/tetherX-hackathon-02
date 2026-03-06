// ===== Authentication Service =====
// Simulated auth with localStorage persistence + email verification

const USERS_KEY = 'tetherx_users_v2';
const AUTH_KEY = 'tetherx_auth_v2';
const VERIFY_KEY = 'tetherx_verify_v2';

import { defaultUsers } from '../data/mockData';

// Initialize users in localStorage if not present
const initUsers = () => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(stored);
};

// Get all users
export const getUsers = () => {
    return initUsers();
};

// Save users to localStorage
const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Generate a 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Login
export const login = (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
        return { success: false, error: 'Invalid email or password' };
    }
    if (!user.verified) {
        return { success: false, error: 'Please verify your email first', needsVerification: true, userId: user.id };
    }
    const session = { userId: user.id, email: user.email, role: user.role, loginAt: new Date().toISOString() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, user: { ...user, password: undefined } };
};

// Register new user
export const register = (userData) => {
    const users = getUsers();

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists' };
    }

    const newUser = {
        id: `U${Date.now()}`,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        verified: false,
        phone: userData.phone || '',
        ...(userData.role === 'doctor' && {
            specialization: userData.specialization || 'General',
            department: userData.department || 'General',
            licenseNo: userData.licenseNo || '',
        }),
        ...(userData.role === 'nurse' && {
            department: userData.department || 'General',
            nursingId: userData.nursingId || '',
        }),
        ...(userData.role === 'patient' && {
            patientId: null,
        }),
    };

    const verificationCode = generateVerificationCode();

    users.push(newUser);
    saveUsers(users);

    // Store verification code
    const pending = JSON.parse(localStorage.getItem(VERIFY_KEY) || '{}');
    pending[newUser.id] = { code: verificationCode, email: newUser.email, expiresAt: Date.now() + 10 * 60 * 1000 };
    localStorage.setItem(VERIFY_KEY, JSON.stringify(pending));

    return {
        success: true,
        user: { ...newUser, password: undefined },
        verificationCode,
        message: `Verification code sent to ${newUser.email}`,
    };
};

// Verify email with code
export const verifyEmail = (userId, code) => {
    const pending = JSON.parse(localStorage.getItem(VERIFY_KEY) || '{}');
    const verification = pending[userId];

    if (!verification) {
        return { success: false, error: 'No pending verification found' };
    }

    if (Date.now() > verification.expiresAt) {
        return { success: false, error: 'Verification code expired. Please request a new one.' };
    }

    if (verification.code !== code) {
        return { success: false, error: 'Invalid verification code' };
    }

    // Mark user as verified
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].verified = true;
        saveUsers(users);
    }

    // Clean up pending verification
    delete pending[userId];
    localStorage.setItem(VERIFY_KEY, JSON.stringify(pending));

    return { success: true, message: 'Email verified successfully! You can now log in.' };
};

// Resend verification code
export const resendVerification = (userId) => {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    const verificationCode = generateVerificationCode();
    const pending = JSON.parse(localStorage.getItem(VERIFY_KEY) || '{}');
    pending[userId] = { code: verificationCode, email: user.email, expiresAt: Date.now() + 10 * 60 * 1000 };
    localStorage.setItem(VERIFY_KEY, JSON.stringify(pending));

    return { success: true, verificationCode, message: `New code sent to ${user.email}` };
};

// Get current session
export const getSession = () => {
    const session = localStorage.getItem(AUTH_KEY);
    if (!session) return null;

    const parsed = JSON.parse(session);
    const users = getUsers();
    const user = users.find(u => u.id === parsed.userId);
    if (!user) return null;

    return { ...parsed, user: { ...user, password: undefined } };
};

// Logout
export const logout = () => {
    localStorage.removeItem(AUTH_KEY);
};

// Update user profile
export const updateUserProfile = (userId, updates) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found' };

    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return { success: true, user: { ...users[idx], password: undefined } };
};
