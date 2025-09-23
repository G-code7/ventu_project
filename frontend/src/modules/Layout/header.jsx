import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Auth/authContext';
import ventuLogo from '../../assets/ventu-logo-orange.png';

function Header({ onLoginClick, onRegisterClick }) {
  const auth = useAuth();
  const user = auth?.user;
  const logoutUser = auth?.logoutUser;
  
  // 1. Añadimos un estado para controlar la visibilidad del menú
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // Referencia para detectar clics fuera del menú

  // Efecto para cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    // Añadir el listener cuando el componente se monta
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Limpiar el listener cuando el componente se desmonta
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);


  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img src={ventuLogo} alt="VENTU Logo" className="h-10 w-auto"/>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-orange-500 transition-colors">Hazte Operador</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Idioma</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Ayuda</a>
        </div>
        <div className="flex items-center space-x-2">
            {user ? (
                <div className="relative" ref={menuRef}>
                    {/* 2. El botón ahora es "Menú" y controla el estado */}
                    <button 
                        onClick={() => setMenuOpen(!isMenuOpen)} 
                        className="text-sm font-bold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors shadow flex items-center"
                    >
                        Menú
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    {/* 3. El menú desplegable que se muestra u oculta */}
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100">
                                Mi Perfil
                            </a>
                            <a 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    logoutUser();
                                    setMenuOpen(false);
                                }} 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100"
                            >
                                Cerrar Sesión
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <button onClick={onLoginClick} className="hidden md:block text-sm font-medium text-gray-600 hover:text-orange-500">Iniciar Sesión</button>
                    <button onClick={onRegisterClick} className="text-sm font-bold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 shadow">Registrarse</button>
                </>
            )}
        </div>
      </nav>
    </header>
  );
}

export default Header;