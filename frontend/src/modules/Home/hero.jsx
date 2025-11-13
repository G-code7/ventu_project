import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../assets/hero-home-bg.jpg';
import { SearchIcon } from '../Shared/icons';
import { axiosInstance } from '../Auth/authContext';

function Hero() {
  const navigate = useNavigate();
  
  // Estados de búsqueda
  const [searchParams, setSearchParams] = useState({
    destination: '',
    maxPrice: 1000,
    experienceType: ''
  });

  // Estados para datos de la API
  const [tags, setTags] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [loadingTags, setLoadingTags] = useState(true);

  // Cargar tags y rango de precios al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar tags
        const tagsResponse = await axiosInstance.get('/tags/');
        setTags(tagsResponse.data || []);

        // Cargar tours para calcular rango de precios
        const toursResponse = await axiosInstance.get('/tours/');
        const tours = toursResponse.data.results || toursResponse.data || [];
        
        if (tours.length > 0) {
          const prices = tours.map(tour => parseFloat(tour.final_price || tour.base_price || 0));
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          
          setPriceRange({ min: minPrice, max: maxPrice });
          setSearchParams(prev => ({ ...prev, maxPrice }));
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    
    // destination se mapea a búsqueda general
    if (searchParams.destination) {
      queryParams.append('destination', searchParams.destination);
    }
    
    if (searchParams.maxPrice && searchParams.maxPrice < priceRange.max) {
      queryParams.append('max_price', searchParams.maxPrice);
    }
    
    if (searchParams.experienceType) {
      queryParams.append('tags', searchParams.experienceType);
    }

    navigate(`/destinos?${queryParams.toString()}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section
      className="h-[500px] bg-cover bg-center text-white flex flex-col items-center justify-center relative"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Capa oscura sobre la imagen */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Contenido principal centrado */}
      <div className="relative z-10 text-center w-full px-6">
        <div className="max-w-[1240px] mx-auto">
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
          >
            Explora Venezuela
          </h1>

          <p className="text-lg md:text-xl font-light mb-8">
            Encuentra y reserva experiencias únicas sin complicaciones.
          </p>

          {/* Barra de búsqueda EN UNA LÍNEA */}
          <div className="bg-white p-3 rounded-full shadow-2xl max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-2">
              
              {/* Destino - Más ancho */}
              <div className="flex-1 lg:min-w-[200px]">
                <input
                  type="text"
                  placeholder="🔍 Buscar destino, tour, ciudad..."
                  value={searchParams.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-gray-700 w-full px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 text-sm font-medium"
                />
              </div>

              {/* Separador vertical - solo desktop */}
              <div className="hidden lg:block w-px h-8 bg-gray-300"></div>

              {/* Presupuesto con Slider Compacto */}
              <div className="flex-1 lg:min-w-[180px] px-3 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs font-medium whitespace-nowrap">
                    Hasta
                  </span>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step="10"
                    value={searchParams.maxPrice}
                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-orange-500 font-bold text-sm whitespace-nowrap min-w-[60px] text-right">
                    ${searchParams.maxPrice}
                  </span>
                </div>
              </div>

              {/* Separador vertical - solo desktop */}
              <div className="hidden lg:block w-px h-8 bg-gray-300"></div>

              {/* Tipo de Experiencia */}
              <div className="flex-1 lg:min-w-[160px]">
                {loadingTags ? (
                  <div className="px-4 py-2.5 text-gray-400 text-sm">
                    Cargando...
                  </div>
                ) : (
                  <select
                    value={searchParams.experienceType}
                    onChange={(e) => handleInputChange('experienceType', e.target.value)}
                    className="text-gray-700 w-full px-3 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 text-sm font-medium cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25rem',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">🏷️ Todas</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.name}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Botón de búsqueda */}
              <button
                onClick={handleSearch}
                className="lg:w-auto bg-orange-500 text-white px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 lg:flex-shrink-0"
              >
                <SearchIcon className="w-5 h-5" />
                <span className="lg:hidden">Buscar</span>
              </button>
            </div>
          </div>

          {/* Hint de búsqueda */}
          <p className="text-white/80 text-sm mt-4">
            💡 Prueba: "Choroní", "Full day", "Mérida", "playa"...
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;