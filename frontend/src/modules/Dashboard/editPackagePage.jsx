import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../Auth/authContext';
import { XIcon } from '../Shared/icons';

function EditPackagePage() {
    const navigate = useNavigate();
    const { packageId } = useParams();
    const [error, setError] = useState('');
    
    // Estados completos del formulario (como en createPackagePage)
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState(1);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    // ... más estados si los tienes

    useEffect(() => {
        const fetchPackageData = async () => {
            try {
                const response = await axiosInstance.get(`/tours/${packageId}/`);
                const data = response.data;
                
                // --- MEJORA: Poblamos TODOS los estados del formulario ---
                setTitle(data.title);
                setDescription(data.description);
                setLocation(data.location);
                setDestination(data.destination);
                setPrice(data.price);
                setDuration(data.duration_days);
                setSelectedTags(data.tags.map(tag => tag.id));
            } catch (err) {
                console.error("No se pudo cargar la información del paquete", err);
                setError("No se encontró el paquete o no tienes permiso para editarlo.");
            }
        };

        const fetchTags = async () => {
            // La lógica para cargar todas las etiquetas disponibles es la misma
            try {
                const response = await axiosInstance.get('/tags/');
                setTags(response.data);
            } catch (err) {
                console.error("No se pudieron cargar las etiquetas", err);
            }
        };
        fetchPackageData();
        fetchTags();
    }, [packageId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        
        // --- Agregamos los campos al formulario ---
        formData.append('title', title);
        formData.append('description', description);
        formData.append('location', location);
        formData.append('destination', destination);
        formData.append('price', price);
        formData.append('duration_days', duration);
        formData.append('meeting_point', 'Por definir');
        formData.append('meeting_time', '12:00:00');
        
        selectedTags.forEach(tagId => formData.append('tag_ids', tagId));

        // Aquí podrías añadir la lógica para actualizar imágenes si el usuario selecciona nuevas
        
        try {
            await axiosInstance.patch(`/tours/${packageId}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/me');
        } catch (err) {
            console.error("Error al actualizar el paquete:", err.response?.data);
            setError('Hubo un error al guardar los cambios.');
        }
    };

    // El return con el JSX del formulario es casi idéntico. Solo cambiamos los textos.
    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Cambiamos el título */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Editar Paquete Turístico</h1>
            {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-8">
                
                {/* --- SECCIÓN DE INFORMACIÓN BÁSICA --- */}
                <fieldset className="space-y-4">
                    <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Información Básica</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título del Paquete</label>
                            <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"/>
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ubicación (Estado)</label>
                            <input type="text" name="location" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio Base (USD)</label>
                            <input type="number" name="price" id="price" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                         <div>
                            <label htmlFor="duration_days" className="block text-sm font-medium text-gray-700">Duración (días)</label>
                            <input type="number" name="duration_days" id="duration_days" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción Larga</label>
                        <textarea name="description" id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                </fieldset>

                {/* --- SECCIÓN DE IMÁGENES --- */}
                <fieldset className="space-y-4">
                     <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Imágenes</legend>
                     <div>
                        <label htmlFor="main_image" className="block text-sm font-medium text-gray-700">Imagen Principal</label>
                        <input type="file" name="main_image" id="main_image" onChange={(e) => setMainImage(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
                     </div>
                     <div>
                        <label htmlFor="gallery_images" className="block text-sm font-medium text-gray-700">Imágenes de Galería (selección múltiple)</label>
                        <input type="file" name="gallery_images" id="gallery_images" multiple onChange={(e) => setGalleryImages(Array.from(e.target.files))} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                     </div>
                </fieldset>
                
                {/* --- SECCIÓN DE ETIQUETAS (TAGS) --- */}
                <fieldset>
                    <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Etiquetas</legend>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                        {tags.map(tag => (
                            <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={selectedTags.includes(tag.id)} onChange={() => handleTagChange(tag.id)} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"/>
                                <span className="text-sm text-gray-700">{tag.name}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">¿Qué Incluye el Paquete?</legend>
                    <div className="space-y-2">
                        {includes.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={item} onChange={(e) => handleIncludeChange(index, e.target.value)} placeholder={`Elemento ${index + 1}`} className="w-full p-2 border border-gray-300 rounded-md"/>
                                <button type="button" onClick={() => removeInclude(index)} className="text-red-500 hover:text-red-700 p-1"><XIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addInclude} className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-800">+ Añadir elemento</button>
                </fieldset>

                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                
                <div className="text-right pt-4">
                    <button type="submit" className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-colors shadow-lg transform hover:scale-105">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditPackagePage;