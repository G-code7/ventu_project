import React, { useState, useEffect } from "react";
import { axiosInstance } from "../Auth/authContext";
import Hero from "./hero";
import FeaturedDestinations from "./featuredDestinations";
import Section from "../Layout/section";
import TourCard from "../Tours/tourCard";
import HomeBanner from "../Home/homeBanner";

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

  const handleBannerClick = () => {
    // Aquí puedes redirigir a una página específica, tour destacado, etc.
    console.log("Banner clickeado - Redirigir a oferta especial");
    // Ejemplo: navigate('/special-offer');
  };

  return (
    <>
      <Hero />
      <div className="container mx-auto px-6 py-12 space-y-16">
        <FeaturedDestinations />

        <Section title="Experiencias Populares">
          {loading && <p className="text-center">Cargando...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </Section>

        {/* Banner Promocional */}
        <HomeBanner
          title="Ahorra viajando a Los Roques hasta un 35% descuento"
          subtitle="Oferta de tiempo limitado, vive la experiencia paradisíaca de Los Roques con precios especiales"
          buttonText="Reservar Ahora"
          discount="35%"
          image="https://www.adondealirio.com/wp-content/uploads/2020/09/losroques4.jpg"
          theme="orange"
          onButtonClick={handleBannerClick}
          className="my-8"
        />
      </div>
    </>
  );
}

export default HomePage;
