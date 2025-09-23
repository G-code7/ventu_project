import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './modules/Auth/authContext';
import Header from './modules/Layout/header';
import Footer from './modules/Layout/footer';
import Hero from './modules/Home/hero';
import FeaturedDestinations from './modules/Home/featuredDestinations';
import Section from './modules/Layout/section';
import TourCard from './modules/Tours/tourCard';
import RegisterModal from './modules/Auth/registerModal';
import LoginModal from './modules/Auth/loginModal';

function App() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authTokens, user, setUser, logoutUser } = useAuth();

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserOnLoad = async () => {
        if (authTokens) {
            try {
                const response = await axios.get('http://localhost:8000/api/users/me/', { 
                    headers: { 'Authorization': `Bearer ${authTokens.access}` } 
                });
                setUser(response.data);
            } catch (err) {
                logoutUser();
            }
        }
    };
    fetchUserOnLoad();
  }, [authTokens, setUser, logoutUser]);

useEffect(() => {
    const fetchTours = async () => { /* ... */ };
    fetchTours();
  }, []);

  const openRegisterModal = () => { setLoginModalOpen(false); setRegisterModalOpen(true); };
  const openLoginModal = () => { setRegisterModalOpen(false); setLoginModalOpen(true); };
  const closeModals = () => { setLoginModalOpen(false); setRegisterModalOpen(false); };

  return (
    <>
      <div className={`bg-gray-50 min-h-screen font-sans ${isLoginModalOpen || isRegisterModalOpen ? 'filter blur-sm' : ''}`}>
        <Header onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />
        <main>
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
        </main>
        <Footer />
      </div>

      <RegisterModal isOpen={isRegisterModalOpen} onClose={closeModals} onLoginClick={openLoginModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeModals} onRegisterClick={openRegisterModal} />
    </>
  );
}

export default App;