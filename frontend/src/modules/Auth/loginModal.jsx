import React, { useState } from "react";
import Modal from "../Shared/modal";
import { useAuth, axiosInstance } from "./authContext";

function LoginModal({ isOpen, onClose, onRegisterClick }) {
  const [error, setError] = useState("");
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const response = await axiosInstance.post("/auth/login/", data);

      const tokens = {
        access: response.data.access,
        refresh: response.data.refresh,
      };

      // 🎯 Obtener datos completos del usuario después del login
      try {
        const userResponse = await axiosInstance.get("/users/me/");
        const userData = userResponse.data;
        loginUser(tokens, userData);
        onClose();
      } catch (userError) {
        console.error("Error fetching user profile:", userError);
        // Si falla, usar los datos básicos del token
        const userData = response.data.user || jwtDecode(tokens.access);
        loginUser(tokens, userData);
        onClose();
      }
    } catch (err) {
      console.error("Error de login:", err.response?.data);
      const errorData = err.response?.data;
      let errorMessage =
        "Ocurrió un error inesperado. Intenta de nuevo más tarde.";

      if (errorData) {
        if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Contraseña: ${errorData.password[0]}`;
        }
      }
      setError(errorMessage);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bienvenido de vuelta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Correo electrónico"
        />
        <input
          name="password"
          type="password"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Contraseña"
        />
        {error && (
          <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Iniciar Sesión
        </button>
        <p className="text-center text-sm">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={onRegisterClick}
            className="font-semibold text-orange-500 hover:underline"
          >
            Regístrate
          </button>
        </p>
      </form>
    </Modal>
  );
}
export default LoginModal;
