import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '../Shared/icons';
import dividerImg from '../../assets/home-banner-divider.png';

function HomeBanner({ 
  title = "Ahorra viajando a este destino hasta un 35% descuento",
  subtitle = "Oferta de tiempo limitado, haz click acá abajo para reservar",
  buttonText = "Hacer Reservación",
  discount = "35%",
  image, 
  theme = "orange", 
  tourId = null,
  tourUrl = null,
  onButtonClick = null,
  className = ""
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onButtonClick && typeof onButtonClick === 'function') {
      onButtonClick();
      return;
    }
    if (tourUrl) {
      navigate(tourUrl);
      return;
    }
    if (tourId) {
      navigate(`/tour/${tourId}`);
      return;
    }
    console.warn('HomeBanner: No se configuró tourId, tourUrl o onButtonClick');
  };

  const themes = {
    orange: {
      // Fondo suave
      bg: 'bg-[#FEF7F4]',
      bgLight: 'bg-[#FEF7F4]',
      bgLightDark: 'dark:bg-orange-950/10',
      
      // Textos
      textPrimary: 'text-[#05073C]', // Título y subtítulo
      
      // Badge de descuento
      discountBg: 'bg-[#EB662B]',
      discountText: 'text-white',
      discountShadow: 'drop-shadow-lg',
      
      // Botón
      button: 'bg-[#EB662B] text-white hover:bg-[#d55a23] active:bg-[#c04f1e] shadow-lg hover:shadow-xl',
      buttonIcon: 'text-white'
    },
    blue: {
      // Fondo suave azul claro
      bg: 'bg-[#F0F7FF]',
      bgLight: 'bg-[#F0F7FF]',
      bgLightDark: 'dark:bg-blue-950/10',
      
      // Textos
      textPrimary: 'text-[#0A1E42]', // Azul oscuro para contraste
      
      // Badge de descuento
      discountBg: 'bg-[#2563EB]', // Azul vibrante
      discountText: 'text-white',
      discountShadow: 'drop-shadow-lg',
      
      // Botón
      button: 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af] shadow-lg hover:shadow-xl',
      buttonIcon: 'text-white'
    },
    green: {
      // Fondo suave verde claro
      bg: 'bg-[#F0FDF4]',
      bgLight: 'bg-[#F0FDF4]',
      bgLightDark: 'dark:bg-green-950/10',
      
      // Textos
      textPrimary: 'text-[#14532D]', // Verde muy oscuro para contraste
      
      // Badge de descuento
      discountBg: 'bg-[#16A34A]', // Verde vibrante
      discountText: 'text-white',
      discountShadow: 'drop-shadow-lg',
      
      // Botón
      button: 'bg-[#16A34A] text-white hover:bg-[#15803d] active:bg-[#166534] shadow-lg hover:shadow-xl',
      buttonIcon: 'text-white'
    }
  };

  const currentTheme = themes[theme] || themes.orange;

  return (
    // Full-width background claro
    <section className={`w-full py-6 md:py-8 lg:py-12 ${currentTheme.bgLight} ${currentTheme.bgLightDark} ${className}`}>
      {/* Container con padding */}
      <div className="container mx-auto px-4">
        {/* Bloque principal con max-width 1240px y altura incrementada */}
        <div className={`max-w-[1240px] mx-auto rounded-2xl shadow-xl overflow-hidden relative ${currentTheme.bg}`}>
          
          {/* Grid con altura mínima aumentada en 100px */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Contenido de texto a la izquierda */}
            <div className={`flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 z-10 relative min-h-[500px] lg:min-h-[500px] ${currentTheme.textPrimary}`}>
              
              {/* Badge de descuento con colores del tema */}
              <div className={`inline-flex items-center gap-2 mb-4 md:mb-6 w-fit px-6 py-3 rounded-full ${currentTheme.discountBg} ${currentTheme.discountShadow}`}>
                <span className={`text-4xl sm:text-5xl md:text-6xl font-bold ${currentTheme.discountText}`}>
                  {discount}
                </span>
                <span className={`text-base sm:text-lg md:text-xl font-medium ${currentTheme.discountText}`}>
                  DESCUENTO
                </span>
              </div>

              {/* Título principal */}
              <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight ${currentTheme.textPrimary}`}>
                {title}
              </h2>

              {/* Subtítulo */}
              <p className={`text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-lg opacity-80 ${currentTheme.textPrimary}`}>
                {subtitle}
              </p>

              {/* Botón de acción */}
              <button
                onClick={handleClick}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 sm:gap-3 ${currentTheme.button}`}
              >
                {buttonText}
                <ArrowRightIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${currentTheme.buttonIcon}`} />
              </button>
            </div>

            {/* Imagen a la derecha con divider - altura aumentada */}
            <div className="relative h-80 sm:h-96 md:h-[500px] lg:h-auto lg:min-h-[500px]">
              {/* Imagen de fondo */}
              <img 
                src={image} 
                alt="Promoción" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              
              {/* Divider con height: fit-content */}
              <div 
                className="absolute top-0 -left-1 w-8 sm:w-12 md:w-16 lg:w-20 z-10 pointer-events-none"
                style={{ height: 'fit-content' }}
              >
                <img 
                  src={dividerImg} 
                  alt="" 
                  className="w-full h-auto object-contain"
                  style={{ 
                    filter: 'drop-shadow(2px 0 4px rgba(0,0,0,0.1))',
                    height: 'auto'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeBanner;