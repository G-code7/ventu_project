import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

function HomeBanner({ 
    title = "Descubre Los Roques",
    subtitle = "Playas de arena blanca y aguas cristalinas te esperan",
    buttonText = "Ver oferta",
    discount = "35%",
    image = "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200",
    location = "Dependencias Federales",
    rating = 4.9,
    reviewCount = 127,
    theme = "orange",
    tourId = null,
    tourUrl = null,
    onButtonClick = null,
    className = "",
    variant = "default" // "default", "minimal", "featured"
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
    };

    const themes = {
        orange: {
            accent: 'bg-orange-500',
            accentHover: 'hover:bg-orange-600',
            accentLight: 'bg-orange-500/10',
            accentText: 'text-orange-500',
            gradient: 'from-orange-600 to-orange-500'
        },
        blue: {
            accent: 'bg-blue-500',
            accentHover: 'hover:bg-blue-600',
            accentLight: 'bg-blue-500/10',
            accentText: 'text-blue-500',
            gradient: 'from-blue-600 to-blue-500'
        },
        green: {
            accent: 'bg-emerald-500',
            accentHover: 'hover:bg-emerald-600',
            accentLight: 'bg-emerald-500/10',
            accentText: 'text-emerald-500',
            gradient: 'from-emerald-600 to-emerald-500'
        }
    };

    const currentTheme = themes[theme] || themes.orange;

    // Variante por defecto - Diseño moderno con overlay
    if (variant === "minimal") {
        return (
            <section className={`w-full ${className}`}>
                <div className="max-w-7xl mx-auto">
                    <div 
                        onClick={handleClick}
                        className="relative h-64 md:h-80 rounded-2xl overflow-hidden cursor-pointer group"
                    >
                        {/* Imagen de fondo */}
                        <img 
                            src={image} 
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        
                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                        
                        {/* Contenido */}
                        <div className="absolute inset-0 flex items-center p-8 md:p-12">
                            <div className="max-w-lg">
                                {/* Badge de descuento */}
                                <span className={`inline-block ${currentTheme.accent} text-white text-sm font-bold px-4 py-1 rounded-full mb-4`}>
                                    {discount} OFF
                                </span>
                                
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    {title}
                                </h3>
                                <p className="text-white/80 mb-4">
                                    {subtitle}
                                </p>
                                
                                <span className={`inline-flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all`}>
                                    {buttonText}
                                    <FaArrowRight />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Variante featured - Card destacada
    if (variant === "featured") {
        return (
            <section className={`w-full py-8 ${className}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Imagen */}
                            <div className="relative h-72 lg:h-auto lg:min-h-[400px]">
                                <img 
                                    src={image} 
                                    alt={title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                
                                {/* Badge de descuento flotante */}
                                <div className="absolute top-6 left-6">
                                    <div className={`${currentTheme.accent} text-white px-5 py-3 rounded-2xl shadow-lg`}>
                                        <span className="text-3xl font-black">{discount}</span>
                                        <span className="text-sm font-medium ml-1">OFF</span>
                                    </div>
                                </div>

                                {/* Rating flotante */}
                                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                                    <FaStar className="text-yellow-400" />
                                    <span className="font-bold text-gray-800">{rating}</span>
                                    <span className="text-gray-500 text-sm">({reviewCount} reseñas)</span>
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-8 lg:p-12 flex flex-col justify-center">
                                {/* Location */}
                                <div className="flex items-center gap-2 text-gray-500 mb-4">
                                    <FaMapMarkerAlt className={currentTheme.accentText} />
                                    <span className="text-sm font-medium">{location}</span>
                                </div>

                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                    {title}
                                </h2>

                                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                    {subtitle}
                                </p>

                                {/* Features */}
                                <div className="flex flex-wrap gap-3 mb-8">
                                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                                        ✈️ Traslados incluidos
                                    </span>
                                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                                        🏨 Alojamiento
                                    </span>
                                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                                        🍽️ Comidas
                                    </span>
                                </div>

                                <button
                                    onClick={handleClick}
                                    className={`w-full sm:w-auto ${currentTheme.accent} ${currentTheme.accentHover} text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3`}
                                >
                                    {buttonText}
                                    <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Variante default - Hero banner con diseño diagonal
    return (
        <section className={`w-full py-8 md:py-12 ${className}`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="relative rounded-3xl overflow-hidden min-h-[400px] md:min-h-[450px]">
                    {/* Imagen de fondo */}
                    <img 
                        src={image} 
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Overlay con forma diagonal */}
                    <div className="absolute inset-0">
                        {/* Gradiente principal */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-transparent lg:w-3/5" />
                        
                        {/* Borde diagonal decorativo */}
                        {/* <div className="hidden lg:block absolute top-0 bottom-0 left-[55%] w-32">
                            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polygon 
                                    points="0,0 100,0 0,100" 
                                    fill="rgb(17, 24, 39)" 
                                    fillOpacity="0.95"
                                />
                            </svg>
                        </div> */}
                    </div>

                    {/* Contenido */}
                    <div className="relative z-10 h-full flex items-center p-8 md:p-12 lg:p-16">
                        <div className="max-w-xl">
                            {/* Badge de descuento */}
                            <div className="inline-flex items-center gap-3 mb-6">
                                <div className={`bg-gradient-to-r ${currentTheme.gradient} text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg`}>
                                    🔥 {discount} DESCUENTO
                                </div>
                                {location && (
                                    <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                                        <FaMapMarkerAlt className="text-orange-400" />
                                        <span className="text-sm font-medium">{location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Título */}
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                {title}
                            </h2>

                            {/* Subtítulo */}
                            <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed max-w-lg">
                                {subtitle}
                            </p>

                            {/* Rating */}
                            {rating && (
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar 
                                                key={i} 
                                                className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white font-semibold">{rating}</span>
                                    <span className="text-gray-400">({reviewCount} reseñas)</span>
                                </div>
                            )}

                            {/* Botón CTA */}
                            <button
                                onClick={handleClick}
                                className={`group ${currentTheme.accent} ${currentTheme.accentHover} text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3`}
                            >
                                {buttonText}
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Decoración - círculos sutiles */}
                    <div className="absolute top-10 right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-1/4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
                </div>
            </div>
        </section>
    );
}

export default HomeBanner;