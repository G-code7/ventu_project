import React, { useState } from "react";
import Modal from "../Shared/modal";
import { useAuth, axiosInstance } from "./authContext";

function LoginModal({ isOpen, onClose, onRegisterClick }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const data = Object.fromEntries(new FormData(e.target).entries());
    
    try {
      console.log('🔄 Intentando login con:', { email: data.email });
      const response = await axiosInstance.post("/auth/login/", data);
      console.log('✅ Login exitoso, respuesta:', response.data);
      if (!response.data.access || !response.data.refresh) {
        throw new Error('La respuesta del servidor no contiene tokens válidos');
      }

      const tokens = {
        access: String(response.data.access),
        refresh: String(response.data.refresh),
      };
      
      localStorage.setItem('authTokens', JSON.stringify(tokens));
      console.log('💾 Tokens guardados en localStorage');
      console.log('🔍 Token preview:', tokens.access.substring(0, 20) + '...');
      const tempAxios = axiosInstance.create ? 
        axiosInstance.create() : 
        axiosInstance;
      try {
        const userResponse = await tempAxios.get("/users/me/", {
          headers: {
            Authorization: `Bearer ${tokens.access}`
          }
        });
        
        // 5. Actualizar el contexto con los datos del usuario
        loginUser(userResponse.data);
        onClose();
      } catch (userError) {
        console.error("Error fetching user profile:", userError);
        
        // Si falla obtener el perfil, usar datos básicos del response
        const userData = response.data.user || {
          id: response.data.user_id,
          email: data.email,
          username: data.username || data.email.split('@')[0],
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          role: response.data.role || 'TRAVELER'
        };
        
        loginUser(userData);
        onClose();
      }
    } catch (err) {
      console.error("Error de login:", err.response?.data || err.message);
      const errorData = err.response?.data;
      let errorMessage = "Ocurrió un error inesperado. Intenta de nuevo más tarde.";

      if (errorData) {
        if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Contraseña: ${errorData.password[0]}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bienvenido de vuelta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          required
          disabled={loading}
          className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          placeholder="Correo electrónico"
        />
        <input
          name="password"
          type="password"
          required
          disabled={loading}
          className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          placeholder="Contraseña"
        />
        {error && (
          <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
        <p className="text-center text-sm">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={onRegisterClick}
            disabled={loading}
            className="font-semibold text-orange-500 hover:underline disabled:text-gray-400"
          >
            Regístrate
          </button>
        </p>
      </form>
    </Modal>
  );
}

export default LoginModal;