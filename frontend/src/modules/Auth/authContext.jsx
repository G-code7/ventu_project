import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [loadingAuth, setLoadingAuth] = useState(true);

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

    useEffect(() => {
        const fetchUserOnLoad = async () => {
            if (authTokens) {
                try {
                    const response = await axios.get('http://localhost:8000/api/users/me/', {
                        headers: { 'Authorization': `Bearer ${authTokens.access}` }
                    });
                    setUser(response.data);
                } catch (err) {
                    logoutUser();
                }
            }
            setLoadingAuth(false);
        };
        fetchUserOnLoad();
    }, [authTokens, logoutUser]);

    const contextData = { user, setUser, authTokens, loginUser, logoutUser, loadingAuth };
    
    return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
}
