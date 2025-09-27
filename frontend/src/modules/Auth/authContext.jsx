import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const axiosInstance = axios.create({ baseURL: 'http://localhost:8000/api' });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [loadingAuth, setLoadingAuth] = useState(true);

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        delete axiosInstance.defaults.headers.common['Authorization'];
    }, []);

    const loginUser = useCallback((tokens, userData) => {
        setAuthTokens(tokens);
        setUser(userData || jwtDecode(tokens.access));
        localStorage.setItem('authTokens', JSON.stringify(tokens));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    }, []);

    useEffect(() => {
        const interceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    const refreshToken = JSON.parse(localStorage.getItem('authTokens'))?.refresh;
                    if (refreshToken) {
                        try {
                            const response = await axiosInstance.post('/token/refresh/', {
                                refresh: refreshToken
                            });
                            const newTokens = { access: response.data.access, refresh: refreshToken };
                            loginUser(newTokens);
                            originalRequest.headers['Authorization'] = `Bearer ${newTokens.access}`;
                            return axiosInstance(originalRequest);
                        } catch (refreshError) {
                            console.error("Refresh token fallido, cerrando sesión", refreshError);
                            logoutUser();
                            return Promise.reject(refreshError);
                        }
                    } else {
                        logoutUser();
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => axiosInstance.interceptors.response.eject(interceptor);
    }, [authTokens, loginUser, logoutUser]);

    useEffect(() => {
        if (authTokens) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
            setUser(jwtDecode(authTokens.access));
        }
        setLoadingAuth(false);
    }, []);
    
    const contextData = { user, authTokens, loginUser, logoutUser, loadingAuth };
    
    return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
}