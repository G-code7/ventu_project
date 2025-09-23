import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/authContext';

function CreatePackagePage() {
    const navigate = useNavigate();
    const { authTokens } = useAuth();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        destination: '',
        price: '',
        duration_days: 1,
        what_is_included: '["Transporte", "Almuerzo"]', // Ejemplo en formato JSON
        itinerary: '{"Día 1": "Descripción..."}',      // Ejemplo en formato JSON
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Preparamos los datos, convirtiendo los campos JSON a objetos
            const dataToSubmit = {
                ...formData,
                what_is_included: JSON.parse(formData.what_is_included),
                itinerary: JSON.parse(formData.itinerary),
            };

            await axios.post('http://localhost:8000/api/tours/', dataToSubmit, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.access}`
                }
            });
            // Si tiene éxito, redirigimos al perfil/dashboard
            navigate('/me');
        } catch (err) {
            console.error("Error al crear el paquete:", err.response?.data);
            setError('Hubo un error al crear el paquete. Revisa los campos.');
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold mb-6">Crear Nuevo Paquete Turístico</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título del Paquete</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"/>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ubicación (Estado)</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio Base (USD)</label>
                        <input type="number" name="price" id="price" step="0.01" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="duration_days" className="block text-sm font-medium text-gray-700">Duración (días)</label>
                        <input type="number" name="duration_days" id="duration_days" value={formData.duration_days} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción Larga</label>
                    <textarea name="description" id="description" rows="4" value={formData.description} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                </div>
                
                {/* NOTA: Estos campos JSON son para desarrollo. En una app real, usarías una UI más amigable. */}
                <div>
                    <label htmlFor="what_is_included" className="block text-sm font-medium text-gray-700">Qué Incluye (formato JSON Array)</label>
                    <input type="text" name="what_is_included" id="what_is_included" value={formData.what_is_included} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                </div>

                {error && <p className="text-red-500 text-center">{error}</p>}
                
                <div className="text-right">
                    <button type="submit" className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">
                        Publicar Paquete
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreatePackagePage;