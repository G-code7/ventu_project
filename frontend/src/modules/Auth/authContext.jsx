import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const axiosInstance = axios.create({ 
  baseURL: 'https://ventu-project.onrender.com/api',
});

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
    }, []);

    // 🔧 FUNCIÓN FALTANTE: loginUser
    const loginUser = useCallback((userData) => {
        setUser(userData);
        
        // Recargar tokens desde localStorage después del login
        const tokens = localStorage.getItem('authTokens');
        if (tokens) {
            setAuthTokens(JSON.parse(tokens));
        }
    }, []);

    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/users/me/');
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }, []);

    const checkAuth = useCallback(async () => {
        const tokens = localStorage.getItem('authTokens');
        
        if (!tokens) {
            setLoadingAuth(false);
            return;
        }

        try {
            const parsedTokens = JSON.parse(tokens);
            const decodedToken = jwtDecode(parsedTokens.access);
            const currentTime = Date.now() / 1000;
            
            if (decodedToken.exp < currentTime) {
                try {
                    const response = await axiosInstance.post('/token/refresh/', {
                        refresh: parsedTokens.refresh
                    });
                    const newTokens = {
                        access: response.data.access,
                        refresh: parsedTokens.refresh
                    };
                    localStorage.setItem('authTokens', JSON.stringify(newTokens));
                    setAuthTokens(newTokens);
                    
                    const userProfile = await fetchUserProfile();
                    setUser(userProfile);
                    
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    logoutUser();
                }
            } else {
                setAuthTokens(parsedTokens);
                
                try {
                    const userProfile = await fetchUserProfile();
                    setUser(userProfile);
                } catch (profileError) {
                    console.error("Error fetching user profile:", profileError);
                    setUser({
                        id: decodedToken.user_id,
                        email: decodedToken.email,
                        username: decodedToken.username || '',
                        first_name: decodedToken.first_name || '',
                        last_name: decodedToken.last_name || '',
                        role: decodedToken.role || 'TRAVELER'
                    });
                }
            }
        } catch (error) {
            console.error("Error checking auth:", error);
            logoutUser();
        } finally {
            setLoadingAuth(false);
        }
    }, [fetchUserProfile, logoutUser]);

    // Interceptor para añadir token a las requests
    useEffect(() => {
        const requestInterceptor = axiosInstance.interceptors.request.use(
            (config) => {
                const tokens = localStorage.getItem('authTokens');
                if (tokens) {
                    const parsedTokens = JSON.parse(tokens);
                    config.headers.Authorization = `Bearer ${parsedTokens.access}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    // Interceptor de respuesta para manejar token expirado
    useEffect(() => {
        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    const tokens = localStorage.getItem('authTokens');
                    if (!tokens) {
                        logoutUser();
                        return Promise.reject(error);
                    }

                    const parsedTokens = JSON.parse(tokens);
                    const refreshToken = parsedTokens.refresh;

                    if (refreshToken) {
                        try {
                            const response = await axiosInstance.post('/token/refresh/', {
                                refresh: refreshToken
                            });
                            
                            const newTokens = { 
                                access: response.data.access, 
                                refresh: refreshToken 
                            };
                            
                            localStorage.setItem('authTokens', JSON.stringify(newTokens));
                            setAuthTokens(newTokens);
                            
                            const userProfile = await fetchUserProfile();
                            setUser(userProfile);
                            
                            originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
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

        return () => {
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [logoutUser, fetchUserProfile]);

    // Verificar autenticación al cargar
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const contextData = { 
        user, 
        authTokens, 
        loginUser, 
        logoutUser, 
        loadingAuth,
        checkAuth,
        fetchUserProfile
    };
    
    return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
}