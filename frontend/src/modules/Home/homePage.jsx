import React, { useState, useEffect } from "react";
import { axiosInstance } from "../Auth/authContext";
import Hero from "./hero";
import FeaturedDestinations from "./featuredDestinations";
import ExperienceCategories from "./experienceCategories";
import WhyVentu from "./whyVentu";
import HowToStart from "./howToStart";
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
    console.log("Banner clickeado - Redirigir a oferta especial");
  };

  return (
    <>
      <Hero />
      <div className="container mx-auto px-6 py-12 space-y-16">
        <FeaturedDestinations />

        <Section title="Experiencias Populares">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </Section>

        {/* Home Banner */}
        <HomeBanner
          title="Título del banner"
          subtitle="Subtítulo descriptivo"
          buttonText="Texto del botón"
          discount="35%"
          image="https://www.adondealirio.com/wp-content/uploads/2020/09/losroques4.jpg"
          theme="orange" // orange, blue, green
          className="my-8"
          tourId={6} // ID numérico del tour
          // tourUrl="/tour/6" // O URL completa alternativa
          // onButtonClick={() => {}} // O callback personalizado
        />

      <ExperienceCategories />
      
      <WhyVentu />
      <HowToStart />


      </div>
    </>
  );
}

export default HomePage;
