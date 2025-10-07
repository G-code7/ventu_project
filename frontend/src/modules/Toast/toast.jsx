import React, { useEffect } from 'react';
import { CheckIcon, XIcon } from '../../modules/Shared/icons';

const AlertIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const InfoIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Estilos según el tipo de notificación
  const styles = {
    success: {
      container: 'bg-green-50 border-green-300 text-green-800',
      icon: <CheckIcon className="w-6 h-6 text-green-500" />,
      progressBar: 'bg-green-500'
    },
    error: {
      container: 'bg-red-50 border-red-300 text-red-800',
      icon: <XIcon className="w-6 h-6 text-red-500" />,
      progressBar: 'bg-red-500'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-300 text-yellow-800',
      icon: <AlertIcon className="w-6 h-6 text-yellow-500" />,
      progressBar: 'bg-yellow-500'
    },
    info: {
      container: 'bg-blue-50 border-blue-300 text-blue-800',
      icon: <InfoIcon className="w-6 h-6 text-blue-500" />,
      progressBar: 'bg-blue-500'
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div 
      className={`
        relative overflow-hidden
        min-w-[320px] max-w-[420px]
        p-4 pr-12
        border-2 rounded-xl shadow-2xl
        ${currentStyle.container}
        animate-slide-in-right
        backdrop-blur-sm
      `}
      role="alert"
    >
      {/* Contenido principal */}
      <div className="flex items-start gap-3">
        {/* Icono */}
        <div className="flex-shrink-0 mt-0.5">
          {currentStyle.icon}
        </div>
        
        {/* Mensaje */}
        <div className="flex-1">
          <p className="font-medium leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* Botón de cerrar */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-black/5 transition-colors"
        aria-label="Cerrar notificación"
      >
        <XIcon className="w-4 h-4 opacity-60 hover:opacity-100" />
      </button>

      {/* Barra de progreso animada */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
        <div 
          className={`h-full ${currentStyle.progressBar} animate-progress`}
          style={{ 
            animation: `shrink ${duration}ms linear forwards` 
          }}
        />
      </div>

      {/* Estilos CSS inline para animaciones */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-progress {
          animation: shrink ${duration}ms linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;