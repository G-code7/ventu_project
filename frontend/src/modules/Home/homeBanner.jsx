import React from 'react';
import { ArrowRightIcon } from '../Shared/icons';

function HomeBanner({ 
  title = "Ahorra viajando a este destino hasta un 35% descuento",
  subtitle = "Oferta de tiempo limitado, haz click acá abajo para reservar",
  buttonText = "Hacer Reservación",
  discount = "35%",
  image, 
  theme = "orange", // orange, blue, green
  onButtonClick = () => {},
  className = ""
}) {
  const themes = {
    orange: {
      bg: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      bgLightDark: 'dark:bg-orange-950/20',
      button: 'bg-white text-orange-600 hover:bg-orange-50 dark:bg-orange-100 dark:hover:bg-orange-200'
    },
    blue: {
      bg: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      bgLightDark: 'dark:bg-blue-950/20',
      button: 'bg-white text-blue-600 hover:bg-blue-50 dark:bg-blue-100 dark:hover:bg-blue-200'
    },
    green: {
      bg: 'bg-green-500',
      bgLight: 'bg-green-50',
      bgLightDark: 'dark:bg-green-950/20',
      button: 'bg-white text-green-600 hover:bg-green-50 dark:bg-green-100 dark:hover:bg-green-200'
    }
  };

  const currentTheme = themes[theme] || themes.orange;

  return (
    // Se reemplaza cn(...) con template literals y concatenación de strings
    <section className={`w-full py-6 md:py-8 lg:py-12 ${currentTheme.bgLight} ${currentTheme.bgLightDark} ${className}`}>
      <div className="container mx-auto px-4">
        {/* Se reemplaza cn(...) con template literals */}
        <div className={`max-w-[1240px] mx-auto rounded-2xl shadow-xl overflow-hidden ${currentTheme.bg}`}>
          
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Contenido de texto a la izquierda */}
            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 text-white">
              
              {/* Badge de descuento */}
              <div className="inline-flex items-baseline mb-4 md:mb-6">
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold drop-shadow-lg">
                  {discount}
                </span>
                <span className="text-base sm:text-lg md:text-xl font-medium ml-2 drop-shadow-lg">
                  DESCUENTO
                </span>
              </div>

              {/* Título principal */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 drop-shadow-lg leading-tight">
                {title}
              </h2>

              {/* Subtítulo */}
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 drop-shadow-lg max-w-lg">
                {subtitle}
              </p>

              {/* Botón de acción - Se reemplaza cn(...) con template literals */}
              <button
                onClick={onButtonClick}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2 sm:gap-3 ${currentTheme.button}`}
              >
                {buttonText}
                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Imagen a la derecha */}
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-auto lg:min-h-[400px]">
              <img 
                src={image} 
                alt="Promoción" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeBanner;