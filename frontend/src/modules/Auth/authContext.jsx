import React, { useState, createContext, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    const loginUser = useCallback((tokens, userData) => {
        setAuthTokens(tokens);
        setUser(userData);
        localStorage.setItem('authTokens', JSON.stringify(tokens));
    }, []);
    
    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    }, []);

    const contextData = { user, setUser, authTokens, loginUser, logoutUser };
    return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
}