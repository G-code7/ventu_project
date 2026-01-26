import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaUsers, 
    FaGlobe, 
    FaHandshake, 
    FaStar, 
    FaDollarSign, 
    FaLock, 
    FaHeadset, 
    FaChartLine,
    FaCheckCircle,
    FaPlay,
    FaQuoteLeft,
    FaArrowRight,
    FaMapMarkerAlt,
    FaCalendarCheck,
    FaCreditCard,
    FaMobileAlt,
    FaShieldAlt,
    FaRocket
} from 'react-icons/fa';

function OperadoresLanding() {
    const navigate = useNavigate();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const benefits = [
        {
            icon: <FaUsers className="text-3xl" />,
            title: "Miles de viajeros",
            description: "Accede a una base creciente de turistas buscando experiencias en Venezuela"
        },
        {
            icon: <FaGlobe className="text-3xl" />,
            title: "Presencia digital",
            description: "Tu negocio visible en la plataforma líder de turismo venezolano"
        },
        {
            icon: <FaHandshake className="text-3xl" />,
            title: "Sin exclusividad",
            description: "Trabaja con nosotros sin dejar tus otros canales de venta"
        },
        {
            icon: <FaStar className="text-3xl" />,
            title: "Selección de calidad",
            description: "Operadores verificados para garantizar la mejor experiencia"
        },
        {
            icon: <FaDollarSign className="text-3xl" />,
            title: "Sin costos fijos",
            description: "Solo pagas comisión cuando vendes. Sin mensualidades"
        },
        {
            icon: <FaLock className="text-3xl" />,
            title: "Sin permanencia",
            description: "Entra y sal cuando quieras, sin contratos de largo plazo"
        },
        {
            icon: <FaHeadset className="text-3xl" />,
            title: "Soporte dedicado",
            description: "Equipo de atención disponible para ayudarte"
        },
        {
            icon: <FaChartLine className="text-3xl" />,
            title: "Panel en tiempo real",
            description: "Controla reservas, ingresos y disponibilidad desde tu dashboard"
        },
        {
            icon: <FaCreditCard className="text-3xl" />,
            title: "Pagos seguros",
            description: "Recibe tus pagos de forma puntual y transparente"
        },
        {
            icon: <FaMobileAlt className="text-3xl" />,
            title: "Gestión móvil",
            description: "Administra tu negocio desde cualquier dispositivo"
        }
    ];

    const steps = [
        {
            number: "1",
            title: "Completa tu solicitud",
            description: "Regístrate con los datos de tu operación turística"
        },
        {
            number: "2",
            title: "Revisamos tu perfil",
            description: "Nuestro equipo verificará tu información y te contactará"
        },
        {
            number: "3",
            title: "¡Empieza a vender!",
            description: "Sube tus paquetes y comienza a recibir reservas"
        }
    ];

    const testimonials = [
        {
            name: "Carlos Mendoza",
            company: "Aventuras Los Roques",
            text: "Desde que empezamos con Ventu, nuestras reservas aumentaron un 40%. La plataforma es muy fácil de usar y el equipo siempre está disponible para ayudar.",
            location: "Los Roques, Venezuela"
        },
        {
            name: "María González",
            company: "Canaima Tours",
            text: "Ventu nos ha permitido llegar a viajeros que antes no conocían nuestros servicios. El proceso de registro fue rápido y sencillo.",
            location: "Canaima, Venezuela"
        },
        {
            name: "José Rodríguez",
            company: "Mérida Extrema",
            text: "Lo mejor de Ventu es la transparencia. Veo mis reservas en tiempo real y los pagos siempre llegan puntual. Totalmente recomendado.",
            location: "Mérida, Venezuela"
        }
    ];

    const stats = [
        { number: "500+", label: "Viajeros activos" },
        { number: "50+", label: "Operadores" },
        { number: "100+", label: "Experiencias" },
        { number: "24", label: "Estados cubiertos" }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative min-h-[600px] flex items-center">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920" 
                        alt="Venezuela landscape"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Lleva tu negocio turístico al siguiente nivel
                        </h1>
                        <p className="text-xl text-gray-200 mb-8">
                            Únete a la plataforma líder de turismo en Venezuela y conecta con miles de viajeros
                        </p>

                        {/* Steps Preview */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                {steps.map((step, index) => (
                                    <div key={index} className="flex items-start gap-3 flex-1">
                                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {step.number}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{step.title}</p>
                                            <p className="text-gray-300 text-xs">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link 
                            to="/registro?role=operator"
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
                        >
                            Solicitar registro
                            <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-orange-500 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-orange-100 text-sm uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            <span className="text-orange-500">10 razones</span> para trabajar con nosotros
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Diseñamos nuestra plataforma pensando en las necesidades de los operadores turísticos venezolanos
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {benefits.map((benefit, index) => (
                            <div 
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center"
                            >
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                                    {benefit.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works - Detailed */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            ¿Cómo funciona?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            En solo 3 pasos puedes empezar a recibir reservas
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white h-full">
                                <div className="text-6xl font-bold opacity-20 absolute top-4 right-4">1</div>
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                                    <FaRocket className="text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">Completa tu solicitud</h3>
                                <ul className="space-y-3 text-orange-100">
                                    <li className="flex items-start gap-2">
                                        <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                                        <span>Datos de tu empresa u operación</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                                        <span>Información de contacto</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                                        <span>Tipos de experiencias que ofreces</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative">
                            <div className="bg-gray-900 rounded-2xl p-8 text-white h-full">
                                <div className="text-6xl font-bold opacity-10 absolute top-4 right-4">2</div>
                                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                                    <FaShieldAlt className="text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">Revisamos tu perfil</h3>
                                <ul className="space-y-3 text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                                        <span>Verificamos tu información</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                                        <span>Te contactamos para conocerte</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FaCheckCircle className="text-orange-500 mt-1 flex-shrink-0" />
                                        <span>Acordamos condiciones de trabajo</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white h-full">
                                <div className="text-6xl font-bold opacity-20 absolute top-4 right-4">3</div>
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                                    <FaCalendarCheck className="text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">¡Empieza a vender!</h3>
                                <ul className="space-y-3 text-green-100">
                                    <li className="flex items-start gap-2">
                                        <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                                        <span>Sube tus paquetes turísticos</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                                        <span>Recibe reservas automáticamente</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                                        <span>Gestiona todo desde tu panel</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            ¿Qué dicen nuestros operadores?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div 
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-sm"
                            >
                                <FaQuoteLeft className="text-orange-200 text-4xl mb-4" />
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    "{testimonial.text}"
                                </p>
                                <div className="border-t pt-4">
                                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                    <p className="text-orange-500 text-sm">{testimonial.company}</p>
                                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                                        <FaMapMarkerAlt />
                                        {testimonial.location}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Preview */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Preguntas frecuentes
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "¿Cuánto cuesta registrarse?",
                                a: "El registro es completamente gratuito. Solo cobramos una pequeña comisión por cada reserva confirmada."
                            },
                            {
                                q: "¿Cómo recibo mis pagos?",
                                a: "Los pagos se procesan de forma semanal. Puedes recibir en bolívares a través de transferencia bancaria o pago móvil."
                            },
                            {
                                q: "¿Puedo seguir vendiendo por mi cuenta?",
                                a: "¡Por supuesto! No exigimos exclusividad. Puedes mantener tus otros canales de venta."
                            },
                            {
                                q: "¿Qué tipo de operadores pueden registrarse?",
                                a: "Aceptamos operadores turísticos, guías independientes, agencias de viajes y cualquier empresa que ofrezca experiencias turísticas en Venezuela."
                            }
                        ].map((faq, index) => (
                            <details 
                                key={index}
                                className="bg-gray-50 rounded-xl p-6 group"
                            >
                                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                                    {faq.q}
                                    <span className="text-orange-500 group-open:rotate-180 transition-transform">
                                        ▼
                                    </span>
                                </summary>
                                <p className="mt-4 text-gray-600">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        ¿Listo para crecer con Ventu?
                    </h2>
                    <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                        Únete a los operadores que ya están aumentando sus ventas con nuestra plataforma
                    </p>
                    <Link 
                        to="/registro?role=operator"
                        className="inline-flex items-center gap-2 bg-white text-orange-500 font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        Solicitar registro ahora
                        <FaArrowRight />
                    </Link>
                    <p className="text-orange-200 text-sm mt-4">
                        Sin costos de registro • Sin permanencia • Comienza en minutos
                    </p>
                </div>
            </section>

            {/* Contact Info */}
            <section className="py-12 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-white font-semibold text-lg mb-2">
                                ¿Tienes dudas?
                            </h3>
                            <p className="text-gray-400">
                                Nuestro equipo está listo para ayudarte
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <a 
                                href="mailto:operadores@ventu.com" 
                                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                operadores@ventu.com
                            </a>
                            <a 
                                href="https://wa.me/584141234567" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default OperadoresLanding;