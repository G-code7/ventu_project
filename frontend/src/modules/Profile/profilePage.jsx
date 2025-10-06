import React from 'react';
import { useAuth } from '../Auth/authContext.jsx';
import OperatorDashboard from './operatorDashboard.jsx';

// Creamos un placeholder para el dashboard del viajero
const TravelerDashboard = ({ user }) => (
    <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Mis Viajes</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700">¡Hola, {user.first_name}! Próximamente aquí podrás ver tus reservas y gestionar tu información.</p>
        </div>
    </div>
);

function ProfilePage() {
  const { user } = useAuth();

  // Muestra un estado de carga si el usuario aún no ha sido cargado desde el AuthContext
  if (!user) {
    return <div className="container mx-auto p-8 text-center text-gray-500">Cargando perfil...</div>;
  }

  // El componente ahora actúa como un "selector" que decide qué dashboard mostrar.
  return (
    <div className="container mx-auto py-8 px-4">
      {user.role === 'OPERATOR' ? <OperatorDashboard /> : <TravelerDashboard user={user} />}
    </div>
  );
}

export default ProfilePage;

