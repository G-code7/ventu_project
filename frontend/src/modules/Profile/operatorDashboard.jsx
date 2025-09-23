import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/authContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function OperatorDashboard() {
    const [dashboardData, setDashboardData] = useState([]);
    const { authTokens } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!authTokens) return;
            try {
                const response = await axios.get('http://localhost:8000/api/users/dashboard/', {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                setDashboardData(response.data);
            } catch (error) {
                console.error("Error al cargar los datos del dashboard:", error);
            }
        };
        fetchData();
    }, [authTokens]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Tu Panel de Control</h2>
                <button 
                    onClick={() => navigate('/operator/create-package')}
                    className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                    + Crear Nuevo Paquete
                </button>
            </div>

            {/* Sección del Gráfico */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Actividad Reciente</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="paquetes_creados" stroke="#8884d8" activeDot={{ r: 8 }} name="Paquetes Creados" />
                        <Line type="monotone" dataKey="reservas_recibidas" stroke="#82ca9d" name="Reservas Recibidas" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

             {/* Aquí irían otras secciones del CRM como la lista de paquetes */}
        </div>
    );
}

export default OperatorDashboard;

