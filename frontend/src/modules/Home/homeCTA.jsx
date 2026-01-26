import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowRight } from 'react-icons/fa';

function HomeCTA() {
    const navigate = useNavigate();

    return (
        <section className="relative py-20 -mx-6 overflow-hidden">
            {/* Background con gradiente y patrón */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700">
                {/* Patrón decorativo */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
            </div>

            {/* Círculos decorativos */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

            {/* Contenido */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    ¿Listo para tu próxima aventura en Venezuela?
                </h2>
                
                <p className="text-lg md:text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
                    Descubre playas paradisíacas, montañas majestuosas y experiencias únicas. 
                    Tu viaje soñado está a un click de distancia.
                </p>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate('/destinos')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 
                                 bg-white text-orange-600 font-bold px-8 py-4 rounded-full
                                 shadow-lg hover:shadow-xl transform hover:scale-105 
                                 transition-all duration-300"
                    >
                        <FaSearch />
                        Explorar experiencias
                    </button>

                    <button
                        onClick={() => navigate('/operadores')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 
                                 bg-transparent border-2 border-white text-white font-bold 
                                 px-8 py-4 rounded-full hover:bg-white hover:text-orange-600
                                 transition-all duration-300"
                    >
                        Soy operador turístico
                        <FaArrowRight />
                    </button>
                </div>

                {/* Trust badges */}
                <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🔒</span>
                        <span className="text-sm font-medium">Pago seguro</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <span className="text-sm font-medium">+500 viajeros felices</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🇻🇪</span>
                        <span className="text-sm font-medium">100% Venezuela</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HomeCTA;
