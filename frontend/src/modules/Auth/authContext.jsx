import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Creamos una única instancia de Axios para ser usada en toda la aplicación.
// Esto nos permite configurar "interceptores" para manejar la autenticación automáticamente.
export const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api'
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
        // Limpiamos el encabezado de autorización de nuestra instancia de Axios.
        delete axiosInstance.defaults.headers.common['Authorization'];
    }, []);

    const loginUser = useCallback((tokens, userData) => {
        setAuthTokens(tokens);
        setUser(userData);
        localStorage.setItem('authTokens', JSON.stringify(tokens));
        // Configuramos el encabezado de autorización para todas las futuras peticiones.
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    }, []);
    
    // Este useEffect ahora solo se ejecuta UNA VEZ, cuando el componente se monta por primera vez.
    // Su única misión es verificar si ya existe una sesión en localStorage.
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            if (authTokens) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
                try {
                    // Validamos el token pidiendo los datos del usuario.
                    const response = await axiosInstance.get('/users/me/');
                    setUser(response.data);
                } catch (error) {
                    // Si el token es inválido o ha expirado, cerramos la sesión.
                    console.log("Token de sesión inválido, cerrando sesión.");
                    logoutUser();
                }
            }
            setLoadingAuth(false);
        };

        checkUserLoggedIn();
    }, [logoutUser]); // Depende de logoutUser para evitar "stale closures".

    const contextData = { user, authTokens, loginUser, logoutUser, loadingAuth };
    
    return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
}