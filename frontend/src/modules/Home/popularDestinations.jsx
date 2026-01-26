import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import Section from '../Layout/section';

function PopularDestinations() {
    const navigate = useNavigate();

    const destinations = [
        {
            name: "Los Roques",
            state: "Dependencias Federales",
            image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800",
            tours: 12,
            highlight: "Playas cristalinas"
        },
        {
            name: "Canaima",
            state: "Bolívar",
            image: "https://images.unsplash.com/photo-1561386917-810a67e3e92b?w=800",
            tours: 8,
            highlight: "Salto Ángel"
        },
        {
            name: "Mérida",
            state: "Mérida",
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
            tours: 15,
            highlight: "Aventura extrema"
        },
        {
            name: "Choroní",
            state: "Aragua",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
            tours: 10,
            highlight: "Playa y montaña"
        }
    ];

    const handleClick = (destination) => {
        navigate(`/destinos?destination=${encodeURIComponent(destination.state)}`);
    };

    return (
        <Section 
            title="Destinos Imperdibles"
            subtitle="Los lugares más buscados por nuestros viajeros"
            seeAllLink="/destinos"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {destinations.map((destination, index) => (
                    <div
                        key={index}
                        onClick={() => handleClick(destination)}
                        className="group cursor-pointer relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                        {/* Imagen */}
                        <img
                            src={destination.image}
                            alt={destination.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Badge de tours */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-orange-600 font-bold text-sm">{destination.tours} tours</span>
                        </div>

                        {/* Contenido */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            {/* Highlight tag */}
                            <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                                {destination.highlight}
                            </span>

                            <h3 className="text-2xl font-bold text-white mb-1">
                                {destination.name}
                            </h3>

                            <p className="text-white/80 text-sm flex items-center gap-1 mb-4">
                                <FaMapMarkerAlt className="text-orange-400" />
                                {destination.state}
                            </p>

                            {/* CTA hover */}
                            <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Ver experiencias
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
}

export default PopularDestinations;
