import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Hero from './hero';
import FeaturedDestinations from './featuredDestinations';
import Section from '../Layout/section';
import TourCard from '../Tours/tourCard';

function HomePage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/tours/');
        setTours(response.data);
      } catch (err) {
        setError('No se pudo cargar la información.');
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  return (
    <>
      <Hero />
      <div className="container mx-auto px-6 py-12 space-y-16">
          <FeaturedDestinations />
          <Section title="Experiencias Populares">
            {loading && <p className="text-center">Cargando...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {tours.map(tour => (<TourCard key={tour.id} tour={tour} />))}
            </div>
          </Section>
      </div>
    </>
  );
}

export default HomePage;