import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Section from "../Layout/section";
import { ChevronLeftIcon, ChevronRightIcon } from "../Shared/icons";
import { axiosInstance } from "../Auth/authContext";

function FeaturedDestinations() {
  const navigate = useNavigate();

  // Estados para datos de la API

  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  // Estados de paginación

  const [currentPage, setCurrentPage] = useState(0);

  const [itemsPerView, setItemsPerView] = useState(6);

  const [totalPages, setTotalPages] = useState(0);

  // Cargar destinos desde la API

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);

        const response = await axiosInstance.get("/tours/destinations_stats/");

        const data = response.data || [];

        // Filtrar solo destinos con imagen para mejor UX

        const destinationsWithImages = data.filter((dest) => dest.image);

        setDestinations(destinationsWithImages);

        setError(null);
      } catch (err) {
        console.error("Error cargando destinos:", err);

        setError("No se pudieron cargar los destinos");

        // Fallback a lista vacía

        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Calcular items por vista según el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(2);
      } else if (window.innerWidth < 768) {
        setItemsPerView(3);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(4);
      } else if (window.innerWidth < 1280) {
        setItemsPerView(5);
      } else {
        setItemsPerView(6);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calcular total de páginas cuando cambia itemsPerView
  useEffect(() => {
    setTotalPages(Math.ceil(destinations.length / itemsPerView));
    // Resetear a página 0 cuando cambia la vista
    setCurrentPage(0);
  }, [itemsPerView, destinations.length]);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentDestinations = destinations.slice(
    currentPage * itemsPerView,
    (currentPage + 1) * itemsPerView
  );

  // Manejar click en destino - navegar con filtro

  const handleDestinationClick = (destination) => {
    navigate(
      `/destinos?destination=${encodeURIComponent(
        destination.state || destination.name
      )}`
    );
  };

  // Loading state

  if (loading) {
    return (
      <Section title="Destinos Destacados">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </Section>
    );
  }

  // Error state

  if (error) {
    return (
      <Section title="Destinos Destacados">
        <div className="text-center py-12">
          <p className="text-gray-500">{error}</p>
        </div>
      </Section>
    );
  }

  // Empty state
  if (destinations.length === 0) {
    return (
      <Section title="Destinos Destacados">
        <div className="text-center py-12">
          <p className="text-gray-500">
            No hay destinos disponibles en este momento
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Destinos Destacados" seeAllLink="/destinos">
      <div className="relative">
        {/* Contenedor principal con gradientes laterales */}
        <div className="relative overflow-visible px-4">
          {/* Gradiente izquierdo */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

          {/* Gradiente derecho */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Botón anterior */}
          {totalPages > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 z-20 transition-all duration-200 hover:scale-110 border border-gray-200"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Grid de destinos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-4">
            {currentDestinations.map((destination, index) => (
              <div
                key={`${destination.name}-${index}`}
                onClick={() => handleDestinationClick(destination)}
                className="flex flex-col items-center text-center group cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                {/* Imagen con efecto hover */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover rounded-full shadow-lg transform group-hover:scale-110 transition-all duration-300 border-4 border-white group-hover:border-orange-300"
                    />
                  </div>
                  {/* Efecto de superposición al hover */}
                  <div className="absolute inset-0 rounded-full bg-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </div>

                {/* Información del destino */}
                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-1">
                    {destination.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    {destination.tours}{" "}
                    {destination.tours === 1 ? "experiencia" : "experiencias"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Botón siguiente - solo mostrar si hay más páginas */}
          {totalPages > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 z-20 transition-all duration-200 hover:scale-110 border border-gray-200"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Indicadores de página - solo mostrar si hay más de una página */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 md:mt-8 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`block rounded-full transition-all duration-200 ${
                  currentPage === index
                    ? "bg-orange-500 w-6 h-2"
                    : "bg-gray-300 hover:bg-gray-400 w-2 h-2"
                }`}
                aria-label={`Ir a página ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Contador de páginas */}
        {totalPages > 1 && (
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 font-medium">
              {currentPage + 1} de {totalPages}
            </span>
          </div>
        )}
      </div>
    </Section>
  );
}

export default FeaturedDestinations;
