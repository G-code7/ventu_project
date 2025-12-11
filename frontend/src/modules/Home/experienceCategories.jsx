import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../Layout/section';
import { axiosInstance } from '../Auth/authContext';

function ExperienceCategories() {
  const navigate = useNavigate();

  // Estados
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar categorías desde la API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/tours/experiences_stats/');
        const data = response.data || [];

        // Filtrar solo categorías con imagen y tomar las top 8
        const categoriesWithImages = data
          .filter(cat => cat.image)
          .slice(0, 8);

        setCategories(categoriesWithImages);
        setError(null);
      } catch (err) {
        console.error('Error cargando categorías:', err);
        setError('No se pudieron cargar las categorías');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Manejar click en categoría
  const handleCategoryClick = (category) => {
    // Navegar filtrando por el environment code
    navigate(`/destinos?environment=${encodeURIComponent(category.code)}`);
  };

  // Loading state
  if (loading) {
    return (
      <Section title="Explora por Tipo de Experiencia">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </Section>
    );
  }

  // Error state
  if (error || categories.length === 0) {
    return null; // Ocultar sección si no hay datos
  }

  return (
    <Section title="Explora por Tipo de Experiencia">
      {/* Grid Masonry - diferentes alturas para crear efecto dinámico */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category, index) => {
          // Calcular altura dinámica para efecto masonry
          const heights = [
            'h-48 md:h-64',  // Pequeño
            'h-56 md:h-72',  // Mediano
            'h-64 md:h-80',  // Grande
            'h-52 md:h-68',  // Medio-pequeño
          ];
          const heightClass = heights[index % heights.length];

          return (
            <div
              key={category.code}
              onClick={() => handleCategoryClick(category)}
              className={`
                relative ${heightClass} rounded-2xl overflow-hidden
                cursor-pointer group shadow-lg hover:shadow-2xl
                transform hover:scale-[1.02] transition-all duration-300
              `}
            >
              {/* Imagen de fondo */}
              <img
                src={category.image}
                alt={category.label}
                className="absolute inset-0 w-full h-full object-cover
                           group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t
                            from-black/80 via-black/40 to-transparent
                            group-hover:from-black/90 transition-all duration-300">
              </div>

              {/* Contenido */}
              <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                <div>
                  <h3 className="text-white font-bold text-lg md:text-xl mb-1
                               drop-shadow-lg leading-tight">
                    {category.label}
                  </h3>
                  <p className="text-white/90 text-sm md:text-base font-medium
                              drop-shadow-md">
                    {category.count} {category.count === 1 ? 'experiencia' : 'experiencias'}
                  </p>
                </div>

                {/* Indicador de hover */}
                <div className="mt-3 opacity-0 group-hover:opacity-100
                              transition-opacity duration-300">
                  <span className="inline-flex items-center gap-2 text-white
                                 text-sm font-semibold">
                    Explorar
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1
                               transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA para ver todas */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/destinos')}
          className="inline-flex items-center gap-2 px-6 py-3
                   bg-orange-500 hover:bg-orange-600 text-white font-bold
                   rounded-full shadow-lg hover:shadow-xl
                   transform hover:scale-105 transition-all duration-200"
        >
          Ver todas las experiencias
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </Section>
  );
}

export default ExperienceCategories;
