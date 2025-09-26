import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/authContext';
import { XIcon } from '../Shared/icons';

function CreatePackagePage() {
    const navigate = useNavigate();
    const { authTokens } = useAuth();
    const [error, setError] = useState('');
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState(1);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [includes, setIncludes] = useState(['']);
    const [availableIncludes, setAvailableIncludes] = useState([]); // Lista de ítems desde la API
    const [selectedIncludes, setSelectedIncludes] = useState([]); // IDs de ítems seleccionados
    const [mainImage, setMainImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Hacemos ambas peticiones en paralelo para más eficiencia
                const [tagsResponse, includesResponse] = await Promise.all([
                    axios.get('http://localhost:8000/api/tags/'),
                    axios.get('http://localhost:8000/api/included-items/')
                ]);
                setTags(tagsResponse.data);
                setAvailableIncludes(includesResponse.data);
            } catch (err) {
                console.error("No se pudieron cargar los datos iniciales", err);
                setError("No se pudieron cargar las opciones para el formulario.");
            }
        };
        fetchInitialData();
    }, []);

    const handleTagChange = (tagId) => {
        setSelectedTags(prev => 
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const handleIncludeChange = (itemId) => {
        setSelectedIncludes(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('location', location);
        formData.append('destination', destination);
        formData.append('price', price);
        formData.append('duration_days', duration);
        formData.append('meeting_point', 'Por definir');
        formData.append('meeting_time', '12:00:00');
        
        selectedTags.forEach(tagId => formData.append('tag_ids', tagId));
        selectedIncludes.forEach(itemId => formData.append('included_item_ids', itemId));

        if (mainImage) formData.append('main_image', mainImage);
        galleryImages.forEach(image => formData.append('gallery_images', image));

        try {
            await axios.post('http://localhost:8000/api/tours/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authTokens.access}`
                }
            });
            navigate('/me');
        } catch (err) {
            console.error("Error al crear el paquete:", err.response?.data);
            setError('Hubo un error al crear el paquete. Revisa que todos los campos estén correctos.');
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Crear Nuevo Paquete Turístico</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-8">
                
                <fieldset className="space-y-4">
                    <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Información Básica</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="title">Título del Paquete</label>
                            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="location">Ubicación (Región/Estado)</label>
                            <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="destination">Destino Específico (Ciudad/Parque)</label>
                            <input type="text" id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="price">Precio Base (USD)</label>
                            <input type="number" id="price" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="duration_days">Duración (días)</label>
                            <input type="number" id="duration_days" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description">Descripción Larga</label>
                        <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
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

                {/* --- SECCIÓN 'QUÉ INCLUYE' --- */}
                <fieldset>
                    <legend className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">¿Qué Incluye el Paquete?</legend>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                        {availableIncludes.map(item => (
                            <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={selectedIncludes.includes(item.id)} onChange={() => handleIncludeChange(item.id)} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"/>
                                <span className="text-sm text-gray-700">{item.name}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                
                <div className="text-right pt-4">
                    <button type="submit" className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600">
                        Publicar Paquete
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreatePackagePage;