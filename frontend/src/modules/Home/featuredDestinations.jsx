import React, { useState, useEffect } from "react";
import Section from "../Layout/section";
import { ChevronLeftIcon, ChevronRightIcon } from "../Shared/icons";

function FeaturedDestinations() {
  const destinations = [
    {
      name: "Canaima",
      tours: 15,
      image:
        "https://photo620x400.mnstatic.com/371537cc289b532e8c09a6f1df03ff52/parque-nacional-canaima.jpg",
    },
    {
      name: "Morrocoy",
      tours: 25,
      image: "https://noticias.com.ve/wp-content/uploads/2019/05/morrocoy.jpg",
    },
    {
      name: "Los Roques",
      tours: 18,
      image:
        "https://www.adondealirio.com/wp-content/uploads/2020/09/losroques4.jpg",
    },
    {
      name: "Mérida",
      tours: 30,
      image:
        "https://images.squarespace-cdn.com/content/v1/5d77a7f8ad30356d21445262/1580493463932-NSJ7M1XNO9K687IN3CPV/Pueblo-de-merida-venezuela.jpg",
    },
    {
      name: "La Gran Sabana",
      tours: 12,
      image:
        "https://wakutours.com/wp-content/uploads/2020/06/La-Gran-Sabana-Waku-13.jpg",
    },
    {
      name: "Margarita",
      tours: 22,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzGUcib62biEMUsUH1iJtkN8AVy7U9sQHlcw&s",
    },
    {
      name: "Choroní",
      tours: 14,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/a/af/Colores_de_Pueblo.JPG",
    },
    {
      name: "Colonia Tovar",
      tours: 8,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzDlaOSawYbuI2lHgAwdTaZjfTjF_R2lZK7A&s",
    },
    {
      name: "Roraima",
      tours: 11,
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Mochima",
      tours: 17,
      image:
        "https://images.unsplash.com/photo-1613767815834-606be30b47f2?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [totalPages, setTotalPages] = useState(0);

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

  return (
    <Section title="Destinos Destacados" seeAllLink="/destinations">
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
