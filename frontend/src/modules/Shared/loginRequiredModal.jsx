import React from 'react';
import Modal from './modal';
import { XIcon, UserIcon, LockIcon } from './icons';

function LoginRequiredModal({ isOpen, onClose, onLoginClick, onRegisterClick }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center py-6">
        {/* Icono */}
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <LockIcon className="w-10 h-10 text-orange-500" />
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          ¡Inicia sesión para reservar!
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 mb-8 px-4">
          Para hacer una reserva necesitas tener una cuenta. Es rápido y gratuito.
        </p>

        {/* Botones */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              onLoginClick();
            }}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Iniciar Sesión
          </button>

          <button
            onClick={() => {
              onClose();
              onRegisterClick();
            }}
            className="w-full py-3 bg-white text-orange-600 font-bold rounded-xl border-2 border-orange-500 hover:bg-orange-50 transition-all duration-300"
          >
            Crear Cuenta
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Continuar explorando
          </button>
        </div>

        {/* Beneficios */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Beneficios de tener una cuenta:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center justify-center">
              <span className="text-green-500 mr-2">✓</span>
              Historial de reservas
            </li>
            <li className="flex items-center justify-center">
              <span className="text-green-500 mr-2">✓</span>
              Ofertas exclusivas
            </li>
            <li className="flex items-center justify-center">
              <span className="text-green-500 mr-2">✓</span>
              Proceso de reserva rápido
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default LoginRequiredModal;