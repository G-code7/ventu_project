import React from 'react';
import { FaSearch, FaCalendarCheck, FaPlane, FaStar } from 'react-icons/fa';
import Section from '../Layout/section';

function HowItWorks() {
    const steps = [
        {
            number: "1",
            icon: <FaSearch className="text-2xl" />,
            title: "Explora",
            description: "Busca entre cientos de experiencias en todo Venezuela. Filtra por destino, precio o tipo de aventura.",
            color: "from-orange-400 to-orange-500"
        },
        {
            number: "2",
            icon: <FaCalendarCheck className="text-2xl" />,
            title: "Reserva",
            description: "Elige tu fecha, selecciona los participantes y reserva en segundos. Pago seguro y confirmación inmediata.",
            color: "from-blue-400 to-blue-500"
        },
        {
            number: "3",
            icon: <FaPlane className="text-2xl" />,
            title: "Disfruta",
            description: "Recibe todos los detalles por email. Presenta tu reserva y vive una experiencia inolvidable.",
            color: "from-green-400 to-green-500"
        },
        {
            number: "4",
            icon: <FaStar className="text-2xl" />,
            title: "Comparte",
            description: "Deja tu reseña y ayuda a otros viajeros. Tu opinión hace la diferencia para la comunidad.",
            color: "from-purple-400 to-purple-500"
        }
    ];

    return (
        <Section 
            title="¿Cómo funciona Ventu?"
            subtitle="Reservar tu próxima aventura es más fácil de lo que piensas"
        >
            {/* Timeline desktop */}
            <div className="relative">
                {/* Línea conectora - solo desktop */}
                <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-1 bg-gradient-to-r from-orange-200 via-blue-200 via-green-200 to-purple-200" />

                {/* Grid de pasos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div 
                            key={index}
                            className="flex flex-col items-center text-center group"
                        >
                            {/* Círculo con número e icono */}
                            <div className="relative mb-6">
                                <div className={`
                                    w-24 h-24 rounded-full bg-gradient-to-br ${step.color}
                                    flex items-center justify-center shadow-lg
                                    group-hover:scale-110 transition-transform duration-300
                                    text-white
                                `}>
                                    {step.icon}
                                </div>
                                
                                {/* Badge con número */}
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full
                                              bg-white border-4 border-white shadow-md
                                              flex items-center justify-center
                                              font-bold text-gray-700 text-lg">
                                    {step.number}
                                </div>
                            </div>

                            {/* Contenido */}
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {step.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed max-w-xs">
                                {step.description}
                            </p>

                            {/* Flecha conectora - solo mobile entre items */}
                            {index < steps.length - 1 && (
                                <div className="lg:hidden my-4 text-gray-300">
                                    <svg className="w-6 h-6 transform rotate-90 sm:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-8 py-4 
                             bg-gradient-to-r from-orange-500 to-orange-600 
                             text-white font-bold rounded-full 
                             shadow-lg hover:shadow-xl 
                             transform hover:scale-105 transition-all duration-200"
                >
                    <FaSearch />
                    Empezar a explorar
                </button>
            </div>
        </Section>
    );
}

export default HowItWorks;
