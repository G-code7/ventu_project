import React from 'react';
import { 
    FaShieldAlt, 
    FaCreditCard, 
    FaClock, 
    FaStar, 
    FaHeadset, 
    FaCheckCircle 
} from 'react-icons/fa';
import Section from '../Layout/section';

function WhyChooseVentu() {
    const benefits = [
        {
            icon: <FaShieldAlt className="text-2xl" />,
            title: "Operadores Verificados",
            description: "Todos nuestros operadores pasan un proceso de verificación para garantizar tu seguridad.",
            color: "bg-blue-50 text-blue-500",
            borderColor: "border-blue-200"
        },
        {
            icon: <FaCreditCard className="text-2xl" />,
            title: "Pago Seguro",
            description: "Sistema de pagos protegido. Tu dinero está seguro hasta que disfrutes tu experiencia.",
            color: "bg-green-50 text-green-500",
            borderColor: "border-green-200"
        },
        {
            icon: <FaClock className="text-2xl" />,
            title: "Reserva en Minutos",
            description: "Proceso simple y rápido. Encuentra, compara y reserva sin complicaciones.",
            color: "bg-orange-50 text-orange-500",
            borderColor: "border-orange-200"
        },
        {
            icon: <FaStar className="text-2xl" />,
            title: "Reseñas Reales",
            description: "Lee opiniones de viajeros verificados para tomar la mejor decisión.",
            color: "bg-yellow-50 text-yellow-500",
            borderColor: "border-yellow-200"
        },
        {
            icon: <FaHeadset className="text-2xl" />,
            title: "Soporte Dedicado",
            description: "Nuestro equipo está disponible para ayudarte antes, durante y después.",
            color: "bg-purple-50 text-purple-500",
            borderColor: "border-purple-200"
        },
        {
            icon: <FaCheckCircle className="text-2xl" />,
            title: "Precios Transparentes",
            description: "Sin costos ocultos ni sorpresas. Lo que ves es lo que pagas.",
            color: "bg-pink-50 text-pink-500",
            borderColor: "border-pink-200"
        }
    ];

    return (
        <Section 
            title="¿Por qué elegir Ventu?"
            subtitle="Tu tranquilidad es nuestra prioridad"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                    <div
                        key={index}
                        className={`
                            relative p-6 rounded-2xl border-2 ${benefit.borderColor}
                            bg-white hover:shadow-xl transition-all duration-300
                            transform hover:-translate-y-1 group
                        `}
                    >
                        {/* Icono */}
                        <div className={`
                            ${benefit.color} w-14 h-14 rounded-xl
                            flex items-center justify-center mb-4
                            group-hover:scale-110 transition-transform duration-300
                        `}>
                            {benefit.icon}
                        </div>

                        {/* Contenido */}
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {benefit.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {benefit.description}
                        </p>

                        {/* Decoración de fondo */}
                        <div className={`
                            absolute top-0 right-0 w-20 h-20 -mt-2 -mr-2
                            rounded-full opacity-5 ${benefit.color}
                            blur-2xl group-hover:opacity-10 transition-opacity
                        `} />
                    </div>
                ))}
            </div>

            {/* Badges de confianza */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 items-center">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-gray-600 text-sm font-medium">Registro gratis</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-gray-600 text-sm font-medium">Cancelación flexible</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-gray-600 text-sm font-medium">Atención personalizada</span>
                </div>
            </div>
        </Section>
    );
}

export default WhyChooseVentu;
