import React from 'react';
import { useAuth } from './authContext';

const AuthLoader = ({ children }) => {
  const { loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando tu experiencia...</p>
      </div>
    );
  }

  return children;
};

export default AuthLoader;