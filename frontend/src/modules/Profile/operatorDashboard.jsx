import React, { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../Auth/authContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/authContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EditIcon, TrashIcon } from '../Shared/icons';

const PackageList = ({ packages, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Mis Paquetes Turísticos</h3>
        <div className="space-y-4">
            {packages.length > 0 ? packages.map(pkg => (
                <div key={pkg.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                        <p className="font-bold text-gray-800">{pkg.title}</p>
                        <p className="text-sm text-gray-500">{pkg.location} - ${pkg.price}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to={`/operator/edit-package/${pkg.id}`} className="text-blue-500 hover:text-blue-700">
                            <EditIcon className="w-5 h-5" />
                        </Link>
                        <button onClick={() => onDelete(pkg.id)} className="text-red-500 hover:text-red-700">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )) : (
                <p className="text-center text-gray-500">Aún no has creado ningún paquete.</p>
            )}
        </div>
    </div>
);

function OperatorDashboard() {
    const [dashboardData, setDashboardData] = useState([]);
    const [packages, setPackages] = useState([]); // <-- NUEVO: Estado para los paquetes
    const { authTokens } = useAuth();
    const navigate = useNavigate();

    // --- MEJORADO: Usamos useCallback para evitar re-crear la función ---
    const fetchPackages = useCallback(async () => {
        if (!authTokens) return;
        try {
            const response = await axiosInstance.get('/tours/', {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            setPackages(response.data);
        } catch (error) {
            console.error("Error al cargar los paquetes:", error);
        }
    }, [authTokens]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!authTokens) return;
            try {
                const response = await axiosInstance.get('/users/dashboard/', {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                setDashboardData(response.data);
            } catch (error) {
                console.error("Error al cargar los datos del dashboard:", error);
            }
        };

        fetchDashboardData();
        fetchPackages();
    }, [authTokens, fetchPackages]);

    // --- manejar la eliminación ---
    const handleDeletePackage = async (packageId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este paquete? Esta acción no se puede deshacer.')) {
            try {
                await axiosInstance.delete(`/tours/${packageId}/`, {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                setPackages(prevPackages => prevPackages.filter(p => p.id !== packageId));
            } catch (error) {
                console.error("Error al eliminar el paquete:", error);
                alert('No se pudo eliminar el paquete.');
            }
        }
    };

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

            {/* Sección del Gráfico*/}
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
            {/* --- Lista de paquetes --- */}
            <PackageList packages={packages} onDelete={handleDeletePackage} />
        </div>
    );
}

export default OperatorDashboard;

