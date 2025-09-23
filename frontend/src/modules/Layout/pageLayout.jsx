import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Header from './header';
import Footer from './footer';
import RegisterModal from '../Auth/registerModal';
import LoginModal from '../Auth/loginModal';

function PageLayout() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  const openRegisterModal = () => { setLoginModalOpen(false); setRegisterModalOpen(true); };
  const openLoginModal = () => { setRegisterModalOpen(false); setLoginModalOpen(true); };
  const closeModals = () => { setLoginModalOpen(false); setRegisterModalOpen(false); };

  return (
    <>
      <div className={`bg-gray-50 min-h-screen font-sans ${isLoginModalOpen || isRegisterModalOpen ? 'filter blur-sm' : ''}`}>
        <Header onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>

      <RegisterModal isOpen={isRegisterModalOpen} onClose={closeModals} onLoginClick={openLoginModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeModals} onRegisterClick={openRegisterModal} />
    </>
  );
}

export default PageLayout;