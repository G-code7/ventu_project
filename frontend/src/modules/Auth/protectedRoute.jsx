import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authContext.jsx";

function ProtectedRoute() {
  const { authTokens, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Verificando sesión...</span>
      </div>
    );
  }

  if (!authTokens) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
