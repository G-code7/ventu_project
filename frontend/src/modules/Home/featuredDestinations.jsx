import React, { useState } from 'react';
import Section from '../Layout/section';
import { ChevronLeftIcon, ChevronRightIcon } from '../Shared/icons';

function FeaturedDestinations() {
  const destinations = [
    { name: 'Canaima', tours: 15, image: 'https://placehold.co/400x400/3498db/ffffff?text=Canaima' },
    { name: 'Morrocoy', tours: 25, image: 'https://placehold.co/400x400/3498db/ffffff?text=Morrocoy' },
    { name: 'Los Roques', tours: 18, image: 'https://placehold.co/400x400/3498db/ffffff?text=Los+Roques' },
    { name: 'Mérida', tours: 30, image: 'https://placehold.co/400x400/3498db/ffffff?text=Mérida' },
    { name: 'La Gran Sabana', tours: 12, image: 'https://placehold.co/400x400/3498db/ffffff?text=Sabana' },
    { name: 'Margarita', tours: 22, image: 'https://placehold.co/400x400/3498db/ffffff?text=Margarita' },
    { name: 'Choroní', tours: 14, image: 'https://placehold.co/400x400/3498db/ffffff?text=Choroní' },
    { name: 'Colonia Tovar', tours: 8, image: 'https://placehold.co/400x400/3498db/ffffff?text=Tovar' },
    { name: 'Cataratas', tours: 11, image: 'https://placehold.co/400x400/3498db/ffffff?text=Cataratas' },
    { name: 'Península', tours: 17, image: 'https://placehold.co/400x400/3498db/ffffff?text=Penisula' },
    { name: 'Los Roques 2', tours: 18, image: 'https://placehold.co/400x400/3498db/ffffff?text=Los+Roques' },
    { name: 'Mérida 2', tours: 30, image: 'https://placehold.co/400x400/3498db/ffffff?text=Mérida' },
    { name: 'La Gran Sabana 2', tours: 12, image: 'https://placehold.co/400x400/3498db/ffffff?text=Sabana' },
    { name: 'Margarita 2', tours: 22, image: 'https://placehold.co/400x400/3498db/ffffff?text=Margarita' },
    { name: 'Choroní 2', tours: 14, image: 'https://placehold.co/400x400/3498db/ffffff?text=Choroní' },
    { name: 'Colonia Tovar 2', tours: 8, image: 'https://placehold.co/400x400/3498db/ffffff?text=Tovar' },
    { name: 'Cataratas 2', tours: 11, image: 'https://placehold.co/400x400/3498db/ffffff?text=Cataratas' },
    { name: 'Península 2', tours: 17, image: 'https://placehold.co/400x400/3498db/ffffff?text=Penisula' },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(destinations.length / itemsPerPage);
  
  const handleNext = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const handlePrev = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  // Obtener los destinos para la página actual
  const startIndex = currentPage * itemsPerPage;
  const currentDestinations = destinations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Section title="Destinos Destacados" >
      <div className="max-w-[1320px] mx-auto">
        {/* Contenedor principal del carrusel */}
        <div className="relative flex items-center justify-center px-12">
          {/* Botón anterior */}
          <button 
            onClick={handlePrev}
            className="absolute left-0 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 z-10 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>

          {/* Grid de destinos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full">
            {currentDestinations.map((destination, index) => (
              <div 
                key={`${destination.name}-${startIndex + index}`}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-32 h-32 mb-4"> {/* 130px ≈ 32 * 4 = 128px (cercano a 130px) */}
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover rounded-full shadow-md transform group-hover:scale-110 transition-all duration-300 border-4 border-white group-hover:border-orange-200"
                  />
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">
                  {destination.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {destination.tours} {destination.tours === 1 ? 'experiencia' : 'experiencias'}
                </p>
              </div>
            ))}
          </div>

          {/* Botón siguiente */}
          <button 
            onClick={handleNext}
            className="absolute right-0 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 z-10 transition-all duration-200 hover:scale-110"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Indicadores de página */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`block w-3 h-3 rounded-full transition-all duration-200 ${
                currentPage === index 
                  ? 'bg-orange-500 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

export default FeaturedDestinations;