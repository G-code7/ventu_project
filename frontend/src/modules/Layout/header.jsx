import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Auth/authContext";
import ventuLogo from "../../assets/ventu-logo-orange.png";

// Icono de Perfil de Usuario para el menú
const UserIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

function Header({ onLoginClick, onRegisterClick }) {
  const auth = useAuth();
  const user = auth?.user;
  const logoutUser = auth?.logoutUser;

  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Efecto para cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={ventuLogo} alt="VENTU Logo" className="h-10 w-auto" />
        </Link>

        {/* Navegación Principal (Centro) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
          <Link to="/destinos" className="hover:text-orange-500 transition-colors">
            Destinos
          </Link>
          <a href="#" className="hover:text-orange-500 transition-colors">
            Experiencias
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors">
            Hazte Operador
          </a>
        </div>

        {/* Acciones de Usuario (Derecha) */}
        <div className="flex items-center space-x-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <UserIcon className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium text-gray-800 hidden lg:block">
                  ¡Hola, {user.first_name || user.username}!
                </span>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              {/* Menú Desplegable */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-20 border border-gray-100">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/me"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Mi Perfil / Dashboard
                  </Link>
                  {user.role === "TRAVELER" && (
                    <Link
                      to="/my-trips"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Mis Viajes
                    </Link>
                  )}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      logoutUser();
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cerrar Sesión
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="hidden md:block text-sm font-medium text-gray-700 hover:text-orange-500 px-4 py-2"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={onRegisterClick}
                className="text-sm font-bold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 shadow transition-all duration-300 transform hover:scale-105"
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
