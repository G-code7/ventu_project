import React from 'react';
import heroImage from '../../assets/hero-home-bg.jpg';
import { SearchIcon } from '../Shared/icons';

function Hero() {
  return (
    <section
      className="h-[500px] bg-cover bg-center text-white flex flex-col items-center justify-center relative"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Capa oscura sobre la imagen */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Contenido principal centrado */}
      <div className="relative z-10 text-center w-full px-6">
        {/* Contenedor alineado con el resto del sitio */}
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

          {/* Barra de búsqueda */}
          <div className="bg-white p-2 rounded-full shadow-2xl flex flex-col sm:flex-row sm:items-center sm:space-x-2 max-w-3xl mx-auto text-sm">
            <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1 space-x-2">
              <input
                type="text"
                placeholder="Destino"
                className="text-gray-700 w-full p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <span className="hidden sm:block text-gray-300">|</span>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1 space-x-2">
              <input
                type="text"
                placeholder="Presupuesto"
                className="text-gray-700 w-full p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <span className="hidden sm:block text-gray-300">|</span>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1 space-x-2">
              <input
                type="text"
                placeholder="Tipo de experiencia"
                className="text-gray-700 w-full p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button className="bg-orange-500 text-white rounded-full p-3 hover:bg-orange-600 transition-colors">
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
