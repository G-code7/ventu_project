import React, { useState } from 'react';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Section from '../Layout/section';

function HomeTestimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials = [
        {
            id: 1,
            name: "María García",
            location: "Caracas",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            rating: 5,
            text: "Increíble experiencia en Los Roques. El operador fue muy profesional y la reserva por Ventu fue súper fácil. ¡Definitivamente repetiré!",
            trip: "Full Day Los Roques",
            date: "Enero 2026"
        },
        {
            id: 2,
            name: "Carlos Mendoza",
            location: "Valencia",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            rating: 5,
            text: "Llevé a mi familia a Mérida y fue una experiencia inolvidable. Todo estaba perfectamente organizado. Ventu nos dio mucha confianza.",
            trip: "Aventura en Mérida",
            date: "Diciembre 2025"
        },
        {
            id: 3,
            name: "Ana Rodríguez",
            location: "Maracaibo",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg",
            rating: 5,
            text: "Primera vez usando Ventu y quedé encantada. Encontré tours que no sabía que existían en mi propio país. ¡Venezuela tiene tanto por ofrecer!",
            trip: "Canaima 3 días",
            date: "Enero 2026"
        },
        {
            id: 4,
            name: "José Pérez",
            location: "Barquisimeto",
            avatar: "https://randomuser.me/api/portraits/men/75.jpg",
            rating: 5,
            text: "El proceso de reserva fue muy sencillo y el soporte excelente. Tuve una duda y me respondieron en minutos. Muy recomendado.",
            trip: "Choroní Weekend",
            date: "Enero 2026"
        }
    ];

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    // Mostrar 3 testimonios en desktop, 1 en mobile
    const getVisibleTestimonials = () => {
        const visible = [];
        for (let i = 0; i < 3; i++) {
            const index = (currentIndex + i) % testimonials.length;
            visible.push(testimonials[index]);
        }
        return visible;
    };

    return (
        <div className="bg-gradient-to-br from-orange-50 to-white py-16 -mx-6 px-6">
            <div className="max-w-7xl mx-auto">
                <Section 
                    title="Lo que dicen nuestros viajeros"
                    subtitle="Miles de aventureros ya descubrieron Venezuela con Ventu"
                >
                    <div className="relative">
                        {/* Navegación */}
                        <button
                            onClick={prevTestimonial}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 
                                     bg-white rounded-full p-3 shadow-lg hover:shadow-xl 
                                     transition-all hover:scale-110 hidden md:flex items-center justify-center"
                        >
                            <FaChevronLeft className="text-gray-600" />
                        </button>

                        <button
                            onClick={nextTestimonial}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 
                                     bg-white rounded-full p-3 shadow-lg hover:shadow-xl 
                                     transition-all hover:scale-110 hidden md:flex items-center justify-center"
                        >
                            <FaChevronRight className="text-gray-600" />
                        </button>

                        {/* Grid de testimonios */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                            {getVisibleTestimonials().map((testimonial, index) => (
                                <div
                                    key={`${testimonial.id}-${index}`}
                                    className={`
                                        bg-white rounded-2xl p-6 shadow-lg border border-gray-100
                                        transform transition-all duration-500
                                        ${index === 1 ? 'md:scale-105 md:shadow-xl' : 'md:opacity-90'}
                                    `}
                                >
                                    {/* Quote icon */}
                                    <FaQuoteLeft className="text-orange-200 text-3xl mb-4" />

                                    {/* Texto */}
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        "{testimonial.text}"
                                    </p>

                                    {/* Rating */}
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar 
                                                key={i} 
                                                className={`text-sm ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Usuario */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                            <p className="text-gray-500 text-sm">{testimonial.location}</p>
                                        </div>
                                    </div>

                                    {/* Trip info */}
                                    <div className="mt-4 bg-orange-50 rounded-lg px-3 py-2">
                                        <p className="text-xs text-orange-600 font-medium">
                                            {testimonial.trip} • {testimonial.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Indicadores de página - mobile */}
                        <div className="flex justify-center mt-6 gap-2 md:hidden">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`
                                        w-2 h-2 rounded-full transition-all
                                        ${currentIndex === index ? 'bg-orange-500 w-6' : 'bg-gray-300'}
                                    `}
                                />
                            ))}
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}

export default HomeTestimonials;
