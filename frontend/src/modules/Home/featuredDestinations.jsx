import React, { useState } from 'react';
import Section from '../Layout/section';
import { ChevronLeftIcon, ChevronRightIcon } from '../Shared/icons';

function FeaturedDestinations() {
  const destinations = [
    { name: 'Canaima', tours: 15, image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nojKjDXubFozYOGEQJnUfPmRjugMmT10DQbtEejtaqFGspbefUYa-BM4M8RR6Hxmw27O5VMtSO7_mq5qdMGPOlx03c4piXwuqoizPnNG64DC2Pwue4srcjFoCa1I0g4IL62fGsn=s1360-w1360-h1020-rw' },
    { name: 'Morrocoy', tours: 25, image: 'https://noticias.com.ve/wp-content/uploads/2019/05/morrocoy.jpg' },
    { name: 'Los Roques', tours: 18, image: 'https://www.adondealirio.com/wp-content/uploads/2020/09/losroques4.jpg' },
    { name: 'Mérida', tours: 30, image: 'https://images.squarespace-cdn.com/content/v1/5d77a7f8ad30356d21445262/1580493463932-NSJ7M1XNO9K687IN3CPV/Pueblo-de-merida-venezuela.jpg' },
    { name: 'La Gran Sabana', tours: 12, image: 'https://wakutours.com/wp-content/uploads/2020/06/La-Gran-Sabana-Waku-13.jpg' },
    { name: 'Margarita', tours: 22, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzGUcib62biEMUsUH1iJtkN8AVy7U9sQHlcw&s' },
    { name: 'Choroní', tours: 14, image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Colores_de_Pueblo.JPG' },
    { name: 'Colonia Tovar', tours: 8, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzDlaOSawYbuI2lHgAwdTaZjfTjF_R2lZK7A&s' },
    { name: 'Cataratas', tours: 11, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Península', tours: 17, image: 'https://images.unsplash.com/photo-1613767815834-606be30b47f2?auto=format&fit=crop&w=400&q=80' },
    { name: 'Cataratas', tours: 11, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Península', tours: 17, image: 'https://images.unsplash.com/photo-1613767815834-606be30b47f2?auto=format&fit=crop&w=400&q=80' },
  ];

  const itemsPerPage = 6;
  const totalPages = Math.ceil(destinations.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const handlePrev = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const offset = -(currentPage * 100);

  return (
    <Section title="Destinos Destacados">
      {/* Contenedor principal ajustado a 1240px */}
      {/* para el overflow podría colocarle un blur  en los bordes de los laterales  o algo similar para suavizar la transición */}
      <div className="relative overflow-hidden">
        {/* Botón anterior */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 z-10 transition-all duration-200 hover:scale-110"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
        </button>

        {/* Contenedor de páginas */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${offset}%)` }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 w-full flex justify-center gap-6"
            >
              {destinations
                .slice(
                  pageIndex * itemsPerPage,
                  pageIndex * itemsPerPage + itemsPerPage
                )
                .map((destination, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center group cursor-pointer"
                  >
                    <div className="w-28 h-28 mb-4 md:w-32 md:h-32">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover rounded-full shadow-md transform group-hover:scale-110 transition-all duration-300 border-4 border-white group-hover:border-orange-200"
                      />
                    </div>
                    <h3 className="font-bold text-base md:text-lg text-gray-800 mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {destination.tours}{' '}
                      {destination.tours === 1
                        ? 'experiencia'
                        : 'experiencias'}
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 z-10 transition-all duration-200 hover:scale-110"
        >
          <ChevronRightIcon className="w-6 h-6 text-gray-600" />
        </button>

        {/* Indicadores */}
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
