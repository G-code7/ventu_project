import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authContext.jsx';

function ProtectedRoute() {
  const { authTokens, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen">Verificando sesión...</div>;
  }

  if (!authTokens) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
