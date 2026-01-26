import React, { useState, useEffect } from "react";
import { axiosInstance } from "../Auth/authContext";

// Módulos del Home
import Hero from "./hero";
import FeaturedDestinations from "./featuredDestinations";
import ExperienceCategories from "./experienceCategories";
import HomeBanner from "./homeBanner";
import HomeStats from "./homeStats";
import HomeTestimonials from "./homeTestimonials";
import HowItWorks from "./howItWorks";
import WhyChooseVentu from "./whyChooseVentu";
import PopularDestinations from "./popularDestinations";
import HomeCTA from "./homeCTA";

// Componentes compartidos
import Section from "../Layout/section";
import TourCard from "../Tours/tourCard";

function HomePage() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await axiosInstance.get("/tours/");
                const toursData = response.data.results || response.data;
                setTours(Array.isArray(toursData) ? toursData : []);
            } catch (err) {
                console.error("Error cargando tours:", err);
                setError("No se pudo cargar la información.");
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    return (
        <>
            {/* Hero con búsqueda */}
            <Hero />

            {/* Estadísticas */}
            <HomeStats />

            {/* Contenido principal */}
            <div className="container mx-auto px-6 py-12 space-y-16">
                
                {/* Destinos destacados - Carrusel circular */}
                <FeaturedDestinations />

                {/* Experiencias Populares - Cards de tours */}
                <Section title="Experiencias Populares" seeAllLink="/destinos">
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                    )}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && !error && tours.length === 0 && (
                        <p className="text-center text-gray-500">
                            No hay tours disponibles en este momento.
                        </p>
                    )}
                    {!loading && !error && tours.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {tours.slice(0, 8).map((tour) => (
                                <TourCard key={tour.id} tour={tour} />
                            ))}
                        </div>
                    )}
                </Section>

                {/* Banner promocional */}
                <HomeBanner
                    title="Descubre Los Roques con hasta 35% de descuento"
                    subtitle="Oferta de tiempo limitado. Playas paradisíacas te esperan."
                    buttonText="Ver oferta"
                    discount="35%"
                    image="https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200"
                    theme="orange"
                    tourUrl="/destinos?destination=Los%20Roques"
                />

                {/* Categorías de experiencia - Grid Masonry */}
                <ExperienceCategories />

                {/* Destinos populares - Cards grandes */}
                <PopularDestinations />

            </div>

            {/* Testimonios - Fondo con gradiente */}
            <HomeTestimonials />

            {/* Contenedor para más secciones */}
            <div className="container mx-auto px-6 py-12 space-y-16">
                
                {/* Cómo funciona */}
                <HowItWorks />

                {/* Por qué elegir Ventu */}
                <WhyChooseVentu />

            </div>

            {/* CTA Final */}
            <HomeCTA />
        </>
    );
}

export default HomePage;
