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
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = destinations.length;
  const handleNext = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const handlePrev = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <Section title="Destinos Destacados">
        <div className="relative flex items-center justify-center">
            <button onClick={handlePrev} className="absolute -left-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"><ChevronLeftIcon className="w-6 h-6 text-gray-600"/></button>
            <div className="flex flex-col items-center text-center group cursor-pointer w-48">
                <div className="w-40 h-40 mb-4">
                    <img src={destinations[currentPage].image} alt={destinations[currentPage].name} className="w-full h-full object-cover rounded-full shadow-md transform group-hover:scale-110 transition-transform duration-300"/>
                </div>
                <h3 className="font-bold text-lg text-gray-800">{destinations[currentPage].name}</h3>
                <p className="text-sm text-gray-500">{destinations[currentPage].tours} experiencias</p>
            </div>
            <button onClick={handleNext} className="absolute -right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"><ChevronRightIcon className="w-6 h-6 text-gray-600"/></button>
        </div>
        <div className="flex justify-center mt-8 space-x-2">
            {destinations.map((_, index) => ( <button key={index} onClick={() => setCurrentPage(index)} className={`block w-8 h-1 rounded-full ${currentPage === index ? 'bg-orange-500' : 'bg-gray-300'}`}></button> ))}
        </div>
    </Section>
  );
}

export default FeaturedDestinations;