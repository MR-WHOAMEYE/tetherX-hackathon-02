import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const session = authService.getSession();
        if (session?.user) {
            setUser(session.user);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        const result = authService.login(email, password);
        if (result.success) {
            setUser(result.user);
        }
        return result;
    }, []);

    const register = useCallback(async (userData) => {
        return authService.register(userData);
    }, []);

    const verifyEmail = useCallback(async (userId, code) => {
        return authService.verifyEmail(userId, code);
    }, []);

    const resendVerification = useCallback(async (userId) => {
        return authService.resendVerification(userId);
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    const refreshUser = useCallback(() => {
        const session = authService.getSession();
        if (session?.user) {
            setUser(session.user);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            login,
            register,
            verifyEmail,
            resendVerification,
            logout,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
